<template>
  <div id="files" class="files">
    <datatable defaultSortField="timestamp"
               label="Files"
               :getColumns="columns"
               :getData="data"
               :loading.sync="loading"
    >
    </datatable>
  </div>
</template>

<script>
import { getStore } from '@/api/store';
import Datatable from '@/components/datatable/Datatable.vue';

export default {
  name: 'Files',
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
      this.loading = true;
      getStore({ fileType: 'file', sort: sortField }).then((result) => {
        const samples = result;
        this.loading = false;
        callback(samples);
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
#files {
}
</style>
