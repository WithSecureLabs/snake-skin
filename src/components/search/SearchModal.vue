<template>
  <div id="search-modal" class="search-modal">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Search</p>
      </header>
      <section class="modal-card-body">
        <datatable defaultSortField="timestamp"
                   :columns="columns"
                   :data="data"
                   :loading.sync="loading"
        >
        </datatable>
      </section>
    </div>
  </div>
</template>

<script>
import { getStore } from '@/api/store';
import Datatable from '@/components/datatable/Datatable.vue';

export default {
  name: 'SearchModal',
  components: {
    datatable: Datatable,
  },
  props: {
    search_string: {
      default: () => null,
      type: String,
    },
  },
  data: () => ({
    columns: [
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
    ],
    data: [],
    loading: false,
    searchText: '',
  }),

  mounted() {
    this.searchStore(this.search_string);
  },

  methods: {
    searchStore(text) {
      this.loading = true;
      const filter =
        `filter[authentihash]={"$regex":"${text}","$options":"-i"}&` +
        `filter[name]={"$regex":"${text}"}&` +
        `filter[tags]={"$regex":"${text}","$options":"-i"}&` +
        `filter[imphash]=${text}&` +
        `filter[md5_digest]=${text}&` +
        `filter[pehash]=${text}&` +
        `filter[sha1_digest]=${text}&` +
        `filter[sha256_digest]=${text}&` +
        `filter[sha512_digest]=${text}&` +
        'operator=or';
      getStore({ filter }).then((resp) => {
        if (resp.status === 'success') {
          this.data = resp.data.samples;
        }
        this.loading = false;
      });
    },
  },

  watch: {
    search_string(value) {
      this.searchStore(value);
    },
  },
};
</script>

<style scoped lang="scss">
#search-modal {
}

.modal-card {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  width: auto;
}
</style>
