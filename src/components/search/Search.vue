<template>
  <div id="search" class="search">
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
  data: () => ({
    searchText: '',
  }),

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
