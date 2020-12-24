<template>
  <div class="container">
    <!--div>
      <katex-element expression="'\\frac{a_i}{1+x}'"/>
    </div-->
    <div v-katex="'\\frac{a_i}{1+x}'"></div>
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
    <ul v-if="cases">
      <li v-for="(one_case, index) in cases" :key="index">
        <!--div class="expression">{{ tree }}</div>
        <katex-element expression="expression_tree_as_tex(tree)"/-->
        <div v-if="one_case.sample.bind_variables">
          <form>
            <input v-for="(var_name, var_ix) in one_case.sample.bind_variables"
                   :key="var_ix"
                   v-model="one_case.sample.binding[var_name]"
                   :placeholder="var_name" />
          </form>
          <div>{{ one_case.sample.binding }}</div>
        </div>
        <div v-katex="as_tex(one_case.sample.tree)"
             @click="examine(index)" class="expression"></div>
        <form>
          <label :for="'check-' + index">Is this true?</label>
          <input type="checkbox" v-model="one_case.proposal"
                 :id="'check-' + index" />
          <button type="submit" class="btn btn-success btn-sm"
            >Check</button>
        </form>
      </li>
    </ul>
  </div>
</template>

<script>
// import axios from 'axios';
import {
    build_expression_sample, expression_tree_as_tex,
    simplify_expression_sample, update_predicate_truth,
  } from '../expressions';
/* import VueKatex from 'vue-katex';
import 'katex/dist/katex.min.css'; */

function make_case(sample) {
  return {
    sample,
    proposal: true,
    show_answer: false,
    answer: undefined,
  };
}

export default {
  name: 'LogicalExpressions',
  data() {
    return {
      cases: [
        {
          sample: {
            bind_variables: ['x', 'y', 'z'],
            binding: { },
            tree: { contents: { type: { tex: 'T' } } },
          },
          proposal: true,
          show_answer: false,
          answer: undefined,
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
          universe: new Set([0, 1, 2]),
          predicates: { A: { args_nr: 2 } },
        };
        update_predicate_truth(predicates_space, 'A');
        update_predicate_truth(predicates_space, 'B');
        update_predicate_truth(predicates_space, 'C');
        update_predicate_truth(predicates_space, 'D');
      }
      this.cases = [
        make_case(
          build_expression_sample(this.newSize, this.selected_operators,
                                  predicates_space)),
      ];
    },
    examine(expression_index) {
      this.cases.push(make_case(
        simplify_expression_sample(this.expressions[expression_index][0])));
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
}
a {
  color: #42b983;
}

div.expression {
  margin: 1em;
}
</style>
