<template>
  <div id="memories" class="memories">
    <datatable defaultSortField="timestamp"
               label="Memories"
               :getColumns="columns"
               :getData="data"
               :loading.sync="loading"
    >
    </datatable>
  </div>
</template>

<script>
import { SNAKE_API } from '@/settings';
import Datatable from '@/components/datatable/Datatable.vue';

export default {
  name: 'Memories',
  components: {
    datatable: Datatable,
  },
  data: () => ({
    loading: false,
  }),
  methods: {
    columns(callback) {
      return this.processColumns().then(results => callback(results));
    },

    data(callback, pageNumber, perPage, sortField, sortOrder, search) {
      //return this.processData(pageNumber, perPage, sortField, sortOrder, search)
      //  .then(results => callback(results));
      this.loading = true;
      this.$http.get(`${SNAKE_API}/store?&file_type=memory&sort=timestamp`).then((response) => {
        const samples = response.data.data.samples;
        this.loading = false;
        callback(samples);
      }).catch((e) => {
        console.log(`An error occured - ${e}`);
        this.loading = false;
      });
    },

    async processColumns() {
      this.loading = true;
      const columns = [
        {
          field: 'name',
          label: 'Name',
          routerLink: true,
        },
        {
          field: 'sha256_digest',
          label: 'SHA256',
        },
        {
          field: 'timestamp',
          label: 'Submission Time',
        },
        {
          field: 'tags',
          label: 'Tags',
        },
      ];
      this.loading = false;
      return columns;
    },

    async processData() {
      this.loading = true;
      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
#memories {
}
</style>
