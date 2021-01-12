<template>
  <div class="container">
    <form @submit.prevent="generate">
      <div>
        <input v-model.number="newSize"
               placeholder="Size of sample expression"/>
      </div>
      <div>
        <header>Which operators do you want to include?</header>
        <span v-for="(operator, index) in available_operators" :key="index">
          <input v-model="selected_operators"
                 :id="'operator-' + operator.name"
                 :value="operator.name" type="checkbox" />
          <label :for="'operator-' + operator.name">{{ operator.name }}</label>
        </span>
      </div>
      <!--p>{{ selected_operators }}</p-->
      <div>
        <input v-model="allowQuantifiers" id="allowQuantifiers"
          type="checkbox" />
        <label for="allowQuantifiers">Allow quantifiers?</label>
      </div>
      <button type="submit" class="btn btn-success btn-sm"
        >Generate sample expression</button>
    </form>
    <table v-if="cases.length &gt; 0">
      <tr v-for="(one_case, index) in cases" :key="index">
        <!--div class="expression">{{ tree }}</div>
        <katex-element expression="expression_tree_as_tex(tree)"/-->
        <td :class="['expression',
                     { 'first_binding': one_case.first_binding }]">
          <form v-if="one_case.sample.bind_variables !== undefined"
                @input="quiet(index)">
            <input v-for="(var_name, var_ix) in one_case.sample.bind_variables"
                   :key="var_ix"
                   :id="'varinput' + index + '_' + var_ix"
                   v-model="one_case.sample.binding[var_name]"
                   :placeholder="var_name" />
          </form>
          <p v-katex="as_tex(one_case.sample.tree)" class="expression"></p>
          <p><span v-if="one_case.request_input === true"
            >Please provide values for all of the variables.</span>
            <button v-else @click="examine(index)"
              >Simplify expression</button></p>
          <form @submit.prevent="check(index)">
            <label :for="'check-' + index" style="padding-right: 0.5em;"
              >What is the value of this expression?</label>
            <select v-model="one_case.proposal">
              <option disabled :value="undefined">Select one:</option>
              <option :value="true">True</option>
              <option :value="false">False</option>
            </select>
            <button v-if="!one_case.show_answer"
                    type="submit" class="btn btn-success btn-sm"
              >Check</button>
            <span v-else style="padding-left: 0.5em;">
              <span v-if="one_case.proposal === one_case.answer"
                >Correct!</span>
              <span v-else>Alas, it's actually
              {{ one_case.answer === true ? 'true' : 'false' }}.</span>
            </span>
          </form>
        </td>
        <td v-if="one_case.predicates_space !== undefined" class="predicates">
          <PredicatesEditor :predicates_space="one_case.predicates_space"
            :disabled="one_case.sample.bind_variables === undefined"
            @change="one_case.show_answer = false"
            @update:predicates_space=
              "update_predicates_space(one_case, $event)"/>
        </td>
      </tr>
    </table>
    <!--div>{{ cases }}</div-->
    <!--div>
      <ElementOfSet :set="set_test.set"
                    :subset="set_test.subset"
                    :element="set_test.element" />
      <p>{{ set_test.set }}</p>
      <p>{{ set_test.subset }}</p>
      <p>{{ set_test.element }}</p>
      <ElementOfSet :set="set_test.set"
                    :subset="set_test.subset"
                    :element="1" />
    </div-->
  </div>
</template>

<script>
// import axios from 'axios';
import cloneDeepWith from 'lodash/cloneDeepWith';
import PredicatesEditor from './PredicatesEditor.vue';
// import ElementOfSet from './ElementOfSet.vue';
import {
    build_expression_sample, expression_tree_as_tex,
    simplify_expression_sample, update_predicate_truth,
    evaluate_expression_tree,
  } from '../expressions';
/* import VueKatex from 'vue-katex';
import 'katex/dist/katex.min.css'; */

function make_case(sample, predicates_space, first_binding = false) {
  return {
    sample,
    request_input: false,
    predicates_space,
    proposal: true,
    show_answer: false,
    answer: undefined,
    first_binding,
  };
}

export default {
  name: 'LogicalExpressions',
  components: {
    PredicatesEditor,
    // ElementOfSet,
  },
  data() {
    return {
      cases: [
        {
          sample: {
            bind_variables: ['x', 'y', 'z'],
            binding: { },
            tree: { contents: { type: { tex: 'T',
                                        eval() { return true; } } } },
          },
          request_input: false,
          proposal: true,
          show_answer: false,
          answer: undefined,
          predicates_space: undefined,
          first_binding: false,
        },
      ],
      newSize: '',
      available_operators: [
        { name: 'and' },
        { name: 'or' },
        { name: 'not' },
        { name: 'implication' },
        { name: 'equivalence' },
      ],
      selected_operators: [],
      allowQuantifiers: false,
      set_test: {
        set: new Set([0, 1, 2, 3, 4]),
        subset: new Set([0, 2, 4]),
        element: 2,
      },
    };
  },
  methods: {
    generate() {
      if (this.newSize === '') {
        this.newSize = 5;
      }
      let predicates_space;
      if (this.allowQuantifiers) {
        predicates_space = {
          universe: new Set(['0', '1', '2']),
          predicates: { A: { args_nr: 2 } },
        };
        update_predicate_truth(predicates_space, 'A');
        update_predicate_truth(predicates_space, 'B');
        update_predicate_truth(predicates_space, 'C');
        update_predicate_truth(predicates_space, 'D');
      }
      this.cases.splice(0, this.cases.length,
        make_case(
          build_expression_sample(this.newSize, this.selected_operators,
                                  predicates_space),
          predicates_space));
    },
    examine(case_index) {
      const c = this.cases[case_index];
      let first_binding = false;
      // Validate the binding to make sure all the variables (if any) have
      // non-empty values.
      if (c.sample.bind_variables !== undefined) {
        first_binding = true;
        if (!c.sample.bind_variables.reduce(
              function validator(result, variable) {
                return result && (c.sample.binding[variable] !== undefined
                                  && c.sample.binding[variable].length > 0);
              }, true)) {
          c.request_input = true;
          return;
        }
      }
      const simplified = simplify_expression_sample(c.sample);
      const predicates_space_clone = cloneDeepWith(c.predicates_space,
        function customizer(value) {
          if (value !== undefined && value.clone !== undefined) {
            return value.clone();
          }
          return undefined;
        });
      this.cases.splice(case_index + 1, 0,
                        make_case(simplified, predicates_space_clone,
                                  first_binding));
    },
    check(case_index) {
      const c = this.cases[case_index];
      c.answer = evaluate_expression_tree(c.sample.tree,
        c.predicates_space !== undefined
        ? Array.from(c.predicates_space.universe)
        : undefined);
      c.show_answer = true;
    },
    quiet(case_index) {
      this.cases[case_index].request_input = false;
    },
    update_predicates_space(one_case, event) {
      one_case.predicates_space = event;
    },
    as_tex: expression_tree_as_tex,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  color: #42b983;
}

div.expression {
  margin: 1em;
}

table {
  margin-left: auto;
  margin-right: auto;
}

td.expression {
  padding: 1em;
  border: 1px solid orange;
  vertical-align: top;
}

td.expression.first_binding {
  border-left-width: 3px;
  border-color: #930;
}

td.predicates {
  border: 2px solid blue;
  background-color: #edf;
  width: 40%;
}
</style>
