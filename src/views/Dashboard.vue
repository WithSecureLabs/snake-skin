<template>
  <div id="dashboard" class="dashboard">
    <div class="columns">
      <div class="column">
        <h1 class="title">Recent Files</h1>
        <b-table :data="files">
          <template slot-scope="props">
            <b-table-column field="details" label="Details">
              <div class="level-item">
                <div>
                  <p class="heading">Name</p>
                  <p>{{ props.row.name }}</p>
                </div>
                <div>
                  <p class="heading">Size</p>
                  <p>{{ props.row.size }}KB</p>
                </div>
                <div>
                  <p class="heading">Timestamp</p>
                  <p>{{ props.row.timestamp }}</p>
                </div>
                <div>
                  <p class="heading">MIME</p>
                  <p>{{ props.row.mime }}</p>
                </div>
              </div>
              <div>
                <p class="heading">SHA256</p>
                <router-link tag='a' :to="'file/' + props.row.sha256_digest">
                  <p>{{ props.row.sha256_digest }}</p>
                </router-link>
              </div>
              <div>
                <p class="heading">Tags</p>
                <tags :tags="props.row.tags"></tags>
              </div>
            </b-table-column>
          </template>
          <template slot="empty">
            No Files...
          </template>
        </b-table>
      </div>
      <div class="column">
        <h1 class="title">Recent Memories</h1>
        <b-table :data="memories">
          <template slot-scope="props">
            <b-table-column field="details" label="Details">
              <div class="level-item">
                <div>
                  <p class="heading">Name</p>
                  <p>{{ props.row.name }}</p>
                </div>
                <div>
                  <p class="heading">Size</p>
                  <p>{{ props.row.size }}KB</p>
                </div>
                <div>
                  <p class="heading">Timestamp</p>
                  <p>{{ props.row.timestamp }}</p>
                </div>
                <div>
                  <p class="heading">MIME</p>
                  <p>{{ props.row.mime }}</p>
                </div>
              </div>
              <div>
                <p class="heading">SHA256</p>
                <router-link tag='a' :to="'memory/' + props.row.sha256_digest">
                  <p>{{ props.row.sha256_digest }}</p>
                </router-link>
              </div>
              <div>
                <p class="heading">Tags</p>
                <tags :tags="props.row.tags"></tags>
              </div>
            </b-table-column>
          </template>
          <template slot="empty">
            No Memories...
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getStore } from '@/api/store';
import Tags from '@/components/Tags.vue';

export default {
  name: 'Dashboard',
  components: {
    tags: Tags,
  },
  data: () => ({
    files: [],
    memories: [],
  }),

  mounted() {
    this.getRecentFiles();
    this.getRecentMemories();
  },

  methods: {
    getRecentFiles() {
      getStore({ fileType: 'file', limit: 10, sort: 'timestamp' }).then((result) => {
        this.files = result;
      });
    },

    getRecentMemories() {
      getStore({ fileType: 'memory', limit: 10, sort: 'timestamp' }).then((result) => {
        this.memories = result;
      });
    },
  },
};
</script>

<style lang="scss">
#dashboard {
}

.columns {
  display: flex;
  flex: 1 1 0;
  flex-direction: row;
  flex-wrap: wrap;
}

.column {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
}

.level-item {
  justify-content: left;
  div {
    padding-right: 1rem;
  }
}
</style>
