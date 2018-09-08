<template>
  <div id="memories" class="memories">
    <datatable defaultSortField="timestamp"
               header
               label="Memories"
               :getColumns="columns"
               :getData="data"
               :total="total"
               :loading.sync="loading"
    >
    </datatable>
  </div>
</template>

<script>
import { getStore } from '@/api/store';
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
      let order = -1;
      if (sortOrder === 'asc') {
        order = 1;
      }
      this.loading = true;
      const filter =
        `filter[name]={"$regex":"${search}"}&` +
        `filter[tags]={"$regex":"${search}","$options":"-i"}&` +
        `filter[sha256_digest]=${search}&` +
        `filter[timestamp]=${search}&` +
        'operator=or';
      getStore({
        fileType: 'memory', filter, order, sort: sortField,
      }).then((resp) => {
        let samples = [];
        if (resp.status === 'success') {
          // XXX: Fake pagination until supported in backend
          this.total = resp.data.samples.length;
          samples = resp.data.samples.slice((pageNumber - 1) * perPage, pageNumber * perPage);
        }
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
          sortable: true,
        },
        {
          field: 'sha256_digest',
          label: 'SHA256',
          sortable: true,
        },
        {
          field: 'timestamp',
          label: 'Submission Time',
          sortable: true,
        },
        {
          field: 'tags',
          label: 'Tags',
          sortable: true,
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
