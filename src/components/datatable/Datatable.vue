<template>
  <div id="datatable" class="datatable">
    <!-- Top Line -->
    <nav v-if="header" class="level">
      <div class="level-left">
        <h1 v-if="label" class="title">{{ label }}</h1>
      </div>
      <div class="level-right">
        <div class="level-item">
          <b-field label="Search">
            <b-input v-model="search" placeholder="Search..."></b-input>
          </b-field>
        </div>
      </div>
    </nav>

    <!-- Data Table -->
    <b-table ref="bdatatable"
             backend-pagination
             backend-sorting
             @page-change="onPageChange"
             @sort="onSort"
             :current-page.sync="pageNumber"
             :data="bData"
             :default-sort-direction="defaultSortDirection"
             :default-sort="[sortField, sortOrder]"
             :paginated="isPaginated"
             :per-page="perPage"
             :selected.sync="selected"
             :striped="true"
             :total="bTotal"
    >
      <template slot-scope="props">
        <template v-for="col in bColumns">
          <b-table-column :key="col.field"
                          :field="col.field"
                          :label="col.label"
                          sortable
          >
            <template v-if="typeof col.renderer === 'function'">
              <div v-html="col.renderer(props.row)"></div>
            </template>
            <template v-else-if="typeof col.routerLink !== 'undefined'">
              <router-link tag='a' :to="'/' + props.row.file_type + '/' + props.row.sha256_digest">
                {{ getItem(props.row, col.field) }}
              </router-link>
            </template>
            <template v-else-if="col.field === 'tags'">
              <tags :tags="props.row[col.field]"></tags>
            </template>
            <template v-else>
              <div>
                {{ getItem(props.row, col.field) }}
              </div>
            </template>
          </b-table-column>
        </template>
      </template>
      <template slot="empty">
        <span class="subtitle">No Data...</span>
      </template>
    </b-table>

    <!-- Data Table Info -->
    <div>
    </div>
  </div>
</template>

<script>
import { getItem } from '@/utils/helpers';
import Tags from '@/components/Tags.vue';

export default {
  name: 'Datatable',
  components: {
    tags: Tags,
  },
  props: {
    columns: {
      default: () => [],
      type: Array,
    },
    data: {
      default: () => [],
      type: Array,
    },
    defaultSortField: {
      default: () => 'latest_seen',
      type: String,
    },
    getColumns: {
      default: () => [],
      type: Function,
    },
    getData: {
      default: () => [],
      type: Function,
    },
    header: {
      default: () => false,
      type: Boolean,
    },
    label: {
      default: () => null,
      type: String,
    },
    loading: {
      default: () => false,
      type: Boolean,
    },
    reload: {
      default: () => false,
      type: Boolean,
    },
    selectedRow: {
      default: () => null,
      type: Object,
    },
    total: {
      default: () => 0,
      type: Number,
    },
  },
  data: () => ({
    bColumns: [],
    bData: [],
    bLoading: false,
    bTotal: 0,
    defaultSortDirection: 'desc',
    loadingComponent: null,
    isPaginated: true,
    pageNumber: 1,
    perPage: 25,
    search: '',
    selected: null,
    sortField: 'latest_seen',
    sortOrder: 'desc',
  }),

  created() {
    this.sortField = this.defaultSortField;
  },

  mounted() {
    this.processColumns();
    this.processData();
  },

  methods: {
    getItem,

    onPageChange(page) {
      if (page < 1) {
        this.pageNumber = 1;
      }
      this.pageNumber = page;
      this.processData();
    },

    onSort(field, order) {
      this.sortField = field;
      this.sortOrder = order;
      this.processData();
    },

    processColumns() {
      // Determine whether to use 'backend' functions or provided arrays
      if (this.getColumns.name !== '_default' && this.getColumns.name !== 'default') {
        // Handle async or not
        const columns = this.getColumns(this.setBColumns);
        if (typeof columns !== 'undefined' && !(columns instanceof Promise)) {
          this.bColumns = columns;
        }
      } else {
        this.bColumns = this.columns;
      }
    },

    processData() {
      // Determine whether to use 'backend' functions or provided arrays
      if (this.getData.name !== '_default' && this.getData.name !== 'default') {
        // Handle async or not
        const data = this.getData(
          this.setBData,
          this.pageNumber,
          this.perPage,
          this.sortField,
          this.sortOrder,
          this.search,
        );
        if (typeof data !== 'undefined' && !(data instanceof Promise)) {
          this.bData = data;
        }
      } else {
        const d = this.data.slice();
        d.sort((a, b) => {
          if (a[this.sortField] > b[this.sortField]) {
            return this.sortOrder === 'asc' ? 1 : -1;
          } else if (a[this.sortField] < b[this.sortField]) {
            return this.sortOrder === 'asc' ? -1 : 1;
          }
          return 0;
        });
        this.bData = d;
        this.bTotal = this.data.length;
      }
    },

    setBColumns(value) {
      this.bColumns = value;
    },

    setBData(value) {
      this.bData = value;
    },

    setPageSize(value) {
      if (this.perPage === value) {
        return;
      }
      this.perPage = value;
      this.processData();
    },
  },

  watch: {
    columns() {
      this.processColumns();
    },

    data() {
      this.processData();
    },

    defaultSortField(value) {
      this.sortField = value;
      this.processData();
    },

    loading(value) {
      if (value === true) {
        this.loading_component = this.$loading.open({
          container: this.$refs.bdatatable.$el,
        });
      } else if (this.loading_component !== null) {
        this.loading_component.close();
      }
    },

    reload() {
      this.pageNumber = 1;
      this.processColumns();
      this.processData();
      this.$emit('update:reload', false);
    },

    search() {
      this.processData();
    },

    selected(value) {
      this.$emit('update:selectedRow', value);
    },
    selectedRow(value) {
      this.selected = value;
    },

    total(value) {
      this.bTotal = value;
    },
  },
};
</script>

<style scoped lang="scss">
#datatable {
}

.b-table {
  position: relative;
}
</style>
