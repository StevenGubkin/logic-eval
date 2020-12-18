const functools = require('./functools');
const fulfill = require('./fulfill');

const { identity, element, filter, concat, repeat, harvest,
        join, premap, map } = functools;


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

function object_from_arrays(keys_array, values_array) {
  const result = Object.create(null);

  const keys_generator = element(keys_array);
  const values_generator = element(values_array);

  repeat(join(function (key, value) {
    if (key !== undefined) {
      result[key] = value;
      return result;
    }

    return undefined;
  },
  keys_generator, values_generator));

  return result;
}

function expression_tree_as_tex(root) {
  return tree_traverse(root, is_leaf_object,
    function (node, ...child_results) {
      if (node.value === true) {
        return 'T';
      }
      if (node.value === false) {
        return 'F';
      }

      const fulfill_args = object_from_arrays(node.value.child_names,
        child_results);

      return fulfill(node.value.tex, fulfill_args, identity);
    },
    get_children_object);
}

const basic_node_types = {
  and: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return l && r; },
    tex: '({l} \\wedge {r})',
  },
  or: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return l || r; },
    tex: '({l} \\vee {r})',
  },
  not: {
    child_names: ['e'],
    eval: function (e) { return !e; },
    tex: '(\\neg {e})',
  },
  implication: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return (!l) || r; },
    tex: '({l} \\implies {r})',
  },
  equivalence: {
    child_names: ['l', 'r'],
    eval: function (l, r) { return (l && r) || ((!l) && (!r)); },
    tex: '({l} \\leftrightarrow {r})',
  },
};

const quantifier_node_types = {
  universal_quantifier: {
    child_names: ['e'],
    other: ['variable'],
    tex: '(For all {variable}: {e})',
  },
  existential_quantifier: {
    child_names: ['e'],
    other: ['variable'],
    tex: '(There exists {variable}: {e})',
  },
};

/* For our expressions, the space of predicates is an object of the form:
 *
 * {
 *   universe: Set([0, 1, 2]),  // The overall universe of discourse
 *   predicates: {
 *     A: {
 *       "true": Set([0, 2]),   // Predicate A is true exactly for 0 and 2
 *     },
 *     B: {
 *       "true": Set([0, 1])    // Predicate B is true exactly for 0 and 1
 *     },
 *   }
 * }
 */

/* Updates a `predicates_space` object for the predicate `name` to indicate
 * that that predicate is true for `values`.  If `values` is undefined,
 * randomly select true values from `predicates.universe`.  If `replace` is
 * false, update the predicate's set of true values, rather than replacing it.
 *
 * Updates the `predicates` object in place, and also returns it.
 */
function update_predicate_truth(predicates_space, name,
                                values = undefined, replace = true) {
  if (values === undefined) {
    replace = true;
    values = Array.from(predicates_space.universe).filter(
               function () {
                 const values = [true, false];
                 return values[Math.floor(Math.random() * values.length)];
               });
  } else {
    values.forEach(function (value) {
                     predicates_space.universe.add(value);
                   });
  }

  if (!replace && predicates_space.predicates[name] !== undefined) {
    values.forEach(function (value) {
                     predicates_space.predicates[name].true.add(value);
                   });
  } else {
    predicates_space.predicates[name] = { true: new Set(values) };
  }

  return predicates_space;
}

// function build_expression_tree(size, universe) {
function build_expression_tree(size, predicates = undefined) {
  // const predicates = undefined;
  if (size === 0) {
    const truth_values = [true, false];
    const selected_value = truth_values[
      Math.floor(Math.random() * truth_values.length)];
    return { value: selected_value };
  }

  let type_names = Object.keys(basic_node_types);
  const basic_nr = type_names.length;
  // We only allow quantifiers if we are using some predicates.
  if (predicates !== undefined) {
    type_names = type_names.concat(Object.keys(quantifier_node_types));
  }
  const selected_index = Math.floor(Math.random() * type_names.length);
  const selected_value = type_names[selected_index];
  const selected_type = selected_index < basic_nr
    ? basic_node_types[selected_value]
    : quantifier_node_types[selected_value];
  const child_extents = snap(size - 1, selected_type.child_names.length,
    Math.floor);
  function current_build(s) {
    return build_expression_tree(s, predicates);
  }
  const children = map(child_extents, current_build);

  return {
    value: selected_type,
    children,
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
  build_expression_tree,
  expression_tree_as_tex,
  simplify_expression_tree,
  update_predicate_truth });
