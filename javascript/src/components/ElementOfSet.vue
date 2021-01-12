<template>
  <button @click="membership = !membership" :disabled="disabled"
    >{{ membership === true ? 'T' : 'F' }}</button>
</template>

<script>
export default {
  name: 'ElementOfSet',
  props: {
    array_set: {
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
  emits: ['update:array_set'],
  data() {
    return {
      localset: this.array_set.clone(),
    };
  },
  computed: {
    membership: {
      get() {
        return this.localset.has(this.element);
      },
      set(value) {
        if (value === true) {
          this.localset.set(this.element, true);
        } else {
          this.localset.remove(this.element);
        }
        // Allow Vue's reactivity to see the updated set:
        this.localset = this.localset.clone();
        this.$emit('update:array_set', this.localset);
      },
    },
  },
};
</script>
