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
        <input v-model="allowQuantifiers" id="allowQuantifiers"
          type="checkbox" />
        <label for="allowQuantifiers">Allow quantifiers?</label>
      </div>
      <button type="submit" class="btn btn-success btn-sm"
        >Generate sample expression</button>
    </form>
    <ul v-if="expression_trees">
      <li v-for="(tree, index) in expression_trees" :key="index">
        <!--div class="expression">{{ tree }}</div>
        <katex-element expression="expression_tree_as_tex(tree)"/-->
        <div v-katex="as_tex(tree)"
             @click="simplify(index)" class="expression"></div>
      </li>
    </ul>
  </div>
</template>

<script>
// import axios from 'axios';
import { build_expression_tree, expression_tree_as_tex,
         simplify_expression_tree } from '../expressions';
/* import VueKatex from 'vue-katex';
import 'katex/dist/katex.min.css'; */

export default {
  name: 'LogicalExpressions',
  data() {
    return {
      expression_trees: [],
      newSize: '',
      allowQuantifiers: true,
    };
  },
  methods: {
    generate() {
      if (this.newSize === '') {
        this.newSize = 5;
      }
      this.expression_trees = [build_expression_tree(this.newSize,
        this.allowQuantifiers)];
    },
    simplify(expression_index) {
      this.expression_trees.push(simplify_expression_tree(
        this.expression_trees[expression_index]));
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
