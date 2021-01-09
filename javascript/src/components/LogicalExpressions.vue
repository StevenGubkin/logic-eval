<template>
  <div class="container">
    <!--div>
      <katex-element expression="'\\frac{a_i}{1+x}'"/>
    </div-->
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
    <ul v-if="cases.length &gt; 0">
      <li v-for="(one_case, index) in cases" :key="index">
        <!--div class="expression">{{ tree }}</div>
        <katex-element expression="expression_tree_as_tex(tree)"/-->
        <div v-if="one_case.predicates_space !== undefined">
          <PredicatesEditor :predicates_space="one_case.predicates_space"
            :disabled="one_case.sample.bind_variables === undefined"/>
        </div>
        <div v-if="one_case.sample.bind_variables !== undefined">
          <form @change="quiet(index)">
            <input v-for="(var_name, var_ix) in one_case.sample.bind_variables"
                   :key="var_ix"
                   :id="'varinput' + index + '_' + var_ix"
                   v-model="one_case.sample.binding[var_name]"
                   :placeholder="var_name" />
          </form>
          <!--div>{{ one_case.sample.binding }}</div-->
        </div>
        <p v-if="one_case.request_input === true"
          >Please provide values for all of the variables.</p>
        <div v-katex="as_tex(one_case.sample.tree)"
             @click="examine(index)" class="expression"></div>
        <form @submit.prevent="check(index)">
          <label :for="'check-' + index">Is this true?</label>
          <input type="checkbox" v-model="one_case.proposal"
                 :id="'check-' + index" />
          <button v-if="!one_case.show_answer"
                  type="submit" class="btn btn-success btn-sm"
            >Check</button>
          <span v-else-if="one_case.proposal === one_case.answer"
            >Correct!</span>
          <span v-else>Alas, it's actually
          {{ one_case.answer === true ? 'true' : 'false' }}.</span>
        </form>
      </li>
    </ul>
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
import { cloneDeepWith } from 'lodash';
import PredicatesEditor from './PredicatesEditor.vue';
// import ElementOfSet from './ElementOfSet.vue';
import {
    build_expression_sample, expression_tree_as_tex,
    simplify_expression_sample, update_predicate_truth,
    evaluate_expression_tree,
  } from '../expressions';
/* import VueKatex from 'vue-katex';
import 'katex/dist/katex.min.css'; */

function make_case(sample, predicates_space) {
  return {
    sample,
    request_input: false,
    predicates_space,
    proposal: true,
    show_answer: false,
    answer: undefined,
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
      this.cases.splice(0);
      this.cases.push(make_case(
        build_expression_sample(this.newSize, this.selected_operators,
                                predicates_space),
        predicates_space));
    },
    examine(case_index) {
      console.log('examining');
      const c = this.cases[case_index];
      if (c.sample.bind_variables !== undefined
          && Object.keys(c.sample.binding).length
             !== c.sample.bind_variables.length) {
        c.request_input = true;
        return;
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
                        make_case(simplified, predicates_space_clone));
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
    as_tex: expression_tree_as_tex,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*@import "../node_modules/katex/dist/katex.min.css";*/
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  /*display: inline-block;*/
  margin: 0 10px;
  clear: right;
}
a {
  color: #42b983;
}

div.expression {
  margin: 1em;
}
</style>
