<template>
  <div v-if="predicates_space.universe.size &gt; 0" id="panel"
      :title="(disabled === true
               ? 'The predicate values are fixed for this simplified sample.'
               : '')">
    <table>
      <thead>
        <tr>
          <th />
          <th :colspan="predicates_space.universe.size"
            >Universe of discourse</th>
        </tr>
        <tr>
          <th>Predicate name</th>
          <th v-for="(element, index)
                     in Array.from(predicates_space.universe)"
              :key="index">
            {{ element }}
          </th>
        </tr>
      </thead>
      <tbody v-if="one_dimensional_predicate_entries.length &gt; 0">
        <tr v-for="(entry, index) in one_dimensional_predicate_entries"
            :key="index">
          <th>{{ entry[0] }}<!--({{ entry[1].true_for.to_array() }})--></th>
          <td v-for="(element, el_index) in predicates_space.universe"
              :key="el_index">
            <ElementOfSet :array_set="entry[1].true_for" :element="[element]"
                          @update:array_set="update_truth(entry[0], $event)"
                          :disabled="disabled" :key="entry[1].true_for"/>
            <p v-if="false">{{ entry[1].true_for.has([element]) }}</p>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="multi_dimensional_predicate_entries.length &gt; 0">
      <p v-for="(entry, index) in multi_dimensional_predicate_entries"
         :key="index">
        <strong>Predicate {{ entry[0] }} is true exactly on:</strong>
        {{ entry[1].true_for.get_size() }} tuples of length
        {{ entry[1].args_nr }}:
        <span v-for="(element, el_index) in entry[1].true_for.to_array()"
              :key="el_index">{{ element[0] }}
          <span v-if="el_index &lt; entry[1].true_for.get_size() - 1">, </span>
        </span>
      </p>
    </div>
  </div>
  <p v-else>The universe of discourse is empty.  Maybe the developer should add
  an interface for adding elements to it?</p>
</template>

<script>
import ElementOfSet from './ElementOfSet.vue';

export default {
  name: 'PredicatesEditor',
  props: {
    predicates_space: {
      required: true,
    },
    disabled: {
      default: false,
    },
  },
  emits: ['update:predicates_space'],
  components: {
    ElementOfSet,
  },
  computed: {
    one_dimensional_predicate_entries() {
      return Object.entries(this.predicates_space.predicates).filter(
        function (predicate_entry) {
          return predicate_entry[1].args_nr === 1;
        });
    },
    multi_dimensional_predicate_entries() {
      return Object.entries(this.predicates_space.predicates).filter(
        function (predicate_entry) {
          return predicate_entry[1].args_nr > 1;
        });
    },
  },
  methods: {
    update_truth(predicate_name, event) {
      const predicates = { ...this.predicates_space.predicates };
      predicates[predicate_name].true_for = event;
      const predicates_space = {
        ...this.predicates_space,
        predicates,
      };

      this.$emit('update:predicates_space', predicates_space);
    },
  },
};
</script>

<style>
</style>
