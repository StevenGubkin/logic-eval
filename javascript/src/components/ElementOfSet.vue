<template>
  <input v-model="membership" id="membership" type="checkbox" />
</template>

<script>
export default {
  name: 'ElementOfSet',
  props: ['set', 'element'],
  computed: {
    membership: {
      get() {
        return this.set.has(this.element);
      },
      set(value) {
        if (value === true) {
          this.set.add(this.element, true);
        } else {
          this.set.delete(this.element);
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
