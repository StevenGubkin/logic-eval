<template>
  <input v-model="membership" id="membership" type="checkbox"
         v-if="disabled !== true"/>
  <span v-else-if="membership === true">&#x2611;</span>
  <span v-else>&#x2610;</span>
</template>

<script>
export default {
  name: 'ElementOfSet',
  props: {
    set: {
      type: Object,
      required: true,
    },
    element: {
      required: true,
    },
    disabled: {
      default: false,
    },
  },
  computed: {
    membership: {
      get() {
        return this.set.has(this.element);
      },
      set(value) {
        if (value === true) {
          this.set.set(this.element, true);
        } else {
          this.set.remove(this.element);
        }
      },
    },
  },
  data() {
    return {
    };
  },
};
</script>
