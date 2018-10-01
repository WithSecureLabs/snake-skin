<template>
  <div v-if="all === null" id="search" class="search">
     <input id="input"
            class="input"
            type="text"
            v-model="searchText"
            v-on:keyup.enter="search(searchText)"
            placeholder="Search for a hash or filename..."
    >
  </div>
</template>

<script>
import SearchModal from '@/components/search/SearchModal.vue';

export default {
  name: 'Search',
  props: {
    all: {
      default: () => null,
      type: String,
    },
  },
  data: () => ({
    searchText: '',
  }),

  mounted() {
    // If 'all' is set we are coming here from the URL so set the searchText
    // and proceed!
    // TODO: This is hacky, the above should really be in navbar and this
    // should be standalone to invoke search modal as non modal
    if (this.all !== null) {
      this.searchText = this.all;
      this.search(this.searchText);
    }
  },

  methods: {
    search(text) {
      // TODO: Close model on path change?
      this.$modal.open({
        component: SearchModal,
        hasModalCard: true,
        parent: this.$root,
        props: {
          search_string: text,
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
#search {
  width: 40vw;
}
</style>
