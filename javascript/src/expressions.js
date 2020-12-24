const functools = require('./functools');
const fulfill = require('./fulfill');
const util = require('./util');

const { identity, constant, element, limit, filter, concat, harvest,
        map } = functools;
const { random_element, random_elements, cross_join, next_var_name } = util;


function push_to_result(array, value) {
  array.push(value);
  return array;
}

/* "Breaks" a number into several pieces of random length.  In other words, for
  * a number (`length`), returns an array with `pieces_nr` of random elements
  * such that the elements sum up to `length`.  If you apply a `constraint`
  * function, that function will be applied to each piece before appending it
  * to the result.  For example, set this to `Math.floor` if you want all the
  * pieces to be integers. Note that by default, pieces can be of length 0. */
function snap(length, pieces_nr,
              constraint = identity,
              result = []) {
  if (pieces_nr <= 1) {
    return push_to_result(result, length);
  }
  const piece = constraint(Math.random() * length);
  return snap(length - piece, pieces_nr - 1, constraint,
              push_to_result(result, piece));
}


function simple_is_leaf(node) {
  return !Array.isArray(node);
}

function log_node(node) {
  if (simple_is_leaf(node)) {
    console.log(`Leaf: ${JSON.stringify(node)}`);
  } else {
    console.log(`Subtree root: ${JSON.stringify(node)}`);
  }
  return node;
}


/* The following set of tests assume that the tree is composed of nodes with a
 * simple object structure (where child0, child1, and child2 also have this
 * structure):
 *
 * { data: 'data here', children: [child0, child1, child2] }
 *
 * (Actually, full disclosure, they don't have to have a `data` field.)
 */
function is_leaf_object(node) {
  return node.children === undefined || node.children.length === 0;
}

function get_children_object(node) {
  return node.children;
}


function breadth_first_walk(root, leaf_test = simple_is_leaf,
                            procedure = log_node) {
  const node_generator_factory = element;
  let node_generator = node_generator_factory([root]);
  let next_node = node_generator();

  return function walk_generator() {
    if (next_node !== undefined) {
      if (!leaf_test(next_node)) {
        node_generator = concat(node_generator,
                                node_generator_factory(next_node));
      }
      const result = procedure(next_node);
      next_node = node_generator();
      return result;
    }
    return undefined;
  };
}

function tree_traverse(root, leaf_test = simple_is_leaf,
                       procedure = log_node, get_children = identity) {
  function partial(node) {
    return tree_traverse(node, leaf_test, procedure, get_children);
  }

  if (leaf_test(root)) {
    return procedure(root);
  }
  const child_results = map(get_children(root), partial);
  return procedure(root, ...child_results);
}

function object_tree_traverse(root) {
  return tree_traverse(root, is_leaf_object,
    function (node, ...child_results) {
      if (child_results.length === 0) {
        return `${node.value}`;
      }

      return `${node.value}: (\n${child_results.join(', ')})`;
    },
    get_children_object);
}

function expression_tree_as_tex(root) {
  return tree_traverse(root, is_leaf_object,
    function (node, ...child_results) {
      /* if (is_leaf_object(node)) {
        return node.contents.type.tex;
      }

      const fulfill_args = object_from_arrays(node.contents.type.child_names,
        child_results);

      return fulfill(node.contents.type.tex, fulfill_args, identity); */
      if (node.contents.type.format !== undefined) {
        return node.contents.type.format(child_results, node.contents);
      }
      return fulfill(node.contents.type.tex, child_results, identity);
    },
    get_children_object);
}

const basic_node_types = {
  and: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return l && r; },
    tex: '({0} \\wedge {1})',
  },
  or: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return l || r; },
    tex: '({0} \\vee {1})',
  },
  not: {
    child_names: ['e'],
    eval: function (e) { return !e; },
    tex: '(\\neg {0})',
  },
  implication: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return (!l) || r; },
    tex: '({0} \\implies {1})',
  },
  equivalence: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return (l && r) || ((!l) && (!r)); },
    tex: '({0} \\leftrightarrow {1})',
  },
};

const boolean_node_types = {
  true_t: {
    eval: function () { return true; },
    tex: 'T',
  },
  false_t: {
    eval: function () { return false; },
    tex: 'F',
  },
};

function init_quantifier_contents(all_variables, stack_variables) {
  const contents = Object.create(null);
  if (all_variables.length === 0) {
    contents.variable = 'a';
  } else {
    contents.variable = next_var_name(all_variables[all_variables.length - 1]);
  }
  all_variables.push(contents.variable);
  stack_variables.push(contents.variable);
  return contents;
}

function quantifier_format(child_results, node_contents) {
  return fulfill(this.tex,
    [node_contents.variable].concat(child_results), identity);
}

const quantifier_node_types = {
  universal_quantifier: {
    child_names: ['e'],
    other: ['variable'],
    tex: '(\\forall {0}: {1})',
    format: quantifier_format,
    init_node_contents: init_quantifier_contents,
  },
  existential_quantifier: {
    child_names: ['e'],
    other: ['variable'],
    tex: '(\\exists {0}: {1})',
    format: quantifier_format,
    init_node_contents: init_quantifier_contents,
  },
};

/* For our expressions, the space of predicates is an object of the form:
 *
 * {
 *   universe: Set([0, 1, 2]),  // The overall universe of discourse
 *   predicates: {
 *     A: {
 *       true_for: Set([0, 2]),   // Predicate A is true exactly for 0 and 2
 *     },
 *     B: {
 *       true_for: Set([0, 1])    // Predicate B is true exactly for 0 and 1
 *     },
 *   }
 * }
 */

/* Updates a `predicates_space` object for the predicate `name` to indicate
 * that that predicate is true for `values`.  `values` should be an array of
 * arrays; the second-dimensional arrays must all have the same length, and the
 * values of each of these arrays correspond to the positional values for which
 * the predicate `name` is true.  If `values` is undefined, randomly select
 * true values from `predicates.universe`.  If `replace` is false, update the
 * predicate's set of true values, rather than replacing it.
 *
 * Updates the `predicates` object in place, and also returns it.
 */
function update_predicate_truth(predicates_space, name,
                                values = undefined, replace = true) {
  let predicate_dimension = 1;
  if (values === undefined) {
    replace = true;
    const universe_array = Array.from(predicates_space.universe);
    if (predicates_space.predicates[name] !== undefined) {
      predicate_dimension = predicates_space.predicates[name].args_nr;
    }
    const universe_args = cross_join(harvest(limit(constant(
                            universe_array), predicate_dimension)));
    values = universe_args.filter(
               function () {
                 const options = [true, false];
                 return options[Math.floor(Math.random() * options.length)];
               });
  } else if (values.length > 0) {
    predicate_dimension = values[0].length;
    values.forEach(function (value) {
                     predicates_space.universe.add(value);
                   });
  }

  if (replace || predicates_space.predicates[name] === undefined) {
    predicates_space.predicates[name] = {
      true_for: new Set(),
      args_nr: predicate_dimension,
      init_node_contents(all_variables, stack_variables) {
        const contents = Object.create(null);
        contents.variables = random_elements(stack_variables, this.args_nr);
        return contents;
      },
      eval(binding) {
        this.binding = binding;
      },
      format(child_results, contents) {
        let params = contents.variables.slice();
        if (contents.value !== undefined) {
          params = params.map(function (param, index) {
              return fulfill('{0}={1}',
                             [param, contents.value[index]], identity);
            });
        }
        return fulfill('{0}({1})', [name, params.join(', ')],
                       identity);
      },
    };
  }
  const predicate = predicates_space.predicates[name];
  values.forEach(function (value) {
                   if (predicate.args_nr !== value.length) {
                     throw RangeError(
                       'All values must have the same length.');
                   }
                   predicates_space.predicates[name].true_for.add(value);
                 });

  return predicates_space;
}

function build_expression_sample(tree_size, operators = undefined,
                                 predicates_space = undefined) {
  // function build_expression_tree(size, universe) {
  const quantified_variables = [];
  function build_expression_tree(size, variables_stack = []) {
    // const predicates = undefined;
    let types = [];
    let selected_type;
    const node = Object.create(null);
    node.contents = Object.create(null);
    function current_build(s) {
      return build_expression_tree(s, variables_stack.slice());
    }

    if (size === 0) {
      types = types.concat(Object.values(boolean_node_types));
      if (predicates_space !== undefined && variables_stack.length > 0) {
        types = types.concat(
          Object.values(predicates_space.predicates).filter(function (p) {
            return p.args_nr <= variables_stack.length;
          }));
      }
      selected_type = random_element(types);
      if (selected_type.init_node_contents !== undefined) {
        node.contents = selected_type.init_node_contents(
          quantified_variables, variables_stack);
      }
      node.contents.type = selected_type;
    } else {
      /* const type_sets = [basic_node_types];
      if (predicates_space !== undefined && Object.keys(
          predicates_space.predicates).length > 0) {
        type_sets.push(quantifier_node_types);

        if (quantified_variables !== undefined) {
          type_sets.push(predicates_space.predicates);
        }
      }

      const type_set = random_element(type_sets); */

      const basic_type_names = operators !== undefined && operators.length > 0
                               ? operators
                               : Object.keys(basic_node_types);
      types = basic_type_names.map(function (name) {
        return basic_node_types[name];
      });

      // const basic_nr = type_names.length;
      // We only allow quantifiers if we are using some predicates.
      if (predicates_space !== undefined && Object.keys(
          predicates_space.predicates).length > 0) {
        // type_names = type_names.concat(Object.keys(quantifier_node_types));
        types = types.concat(Object.values(quantifier_node_types));
      }
      selected_type = random_element(types);
      if (selected_type.init_node_contents !== undefined) {
        node.contents = selected_type.init_node_contents(
          quantified_variables, variables_stack);
      }
      node.contents.type = selected_type;
      const child_extents = snap(size - 1, selected_type.child_names.length,
        Math.floor);
      node.children = child_extents.map(current_build);
    }

    return node;
  }

  const tree = build_expression_tree(tree_size);
  return {
    tree,
    bind_variables: quantified_variables,
    binding: { },
  };
}

function simplify_expression_tree(root) {
  return tree_traverse(root, is_leaf_object,
    function (node, ...child_results) {
      if (is_leaf_object(node)) {
        return {
          value: node.value,
        };
      }
      /* If we find a non-leaf child: */
      if (filter(element(node.children),
                 function (el) {
                   return !is_leaf_object(el);
                 })() !== undefined) {
        return {
          value: node.value,
          children: child_results,
        };
      }
      return {
        value: node.value.eval(...map(node.children,
                                      function (el) { return el.value; })),
      };
    },
    get_children_object);
}

// const example = {x:0,c:[{x:1,c:[{x:2,c:[{x:3},{x:4,c:[{x:5}]},{x:6}]},{x:7},{x:8}]},{x:9}]}; // see <https://stackoverflow.com/questions/38239418/tail-recursive-tree-traversal-without-loops>

module.exports = Object.freeze({
  breadth_first_walk,
  tree_traverse,
  object_tree_traverse,
  // example,
  build_expression_sample,
  expression_tree_as_tex,
  simplify_expression_tree,
  update_predicate_truth });
