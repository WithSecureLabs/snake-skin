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
                <a>{{ props.row.sha256_digest }}</a>
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
                <a>{{ props.row.sha256_digest }}</a>
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
import { SNAKE_API } from '@/settings';
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
      this.$http.get(`${SNAKE_API}/store?&file_type=file&limit=10&sort=timestamp`).then((response) => {
        this.files = response.data.data.samples;
      }).catch((e) => {
        console.log(`An error occured - ${e}`);
      });
    },

    getRecentMemories() {
      this.$http.get(`${SNAKE_API}/store?&file_type=memory&limit=10&sort=timestamp`).then((response) => {
        this.memories = response.data.data.samples;
      }).catch((e) => {
        console.log(`An error occured - ${e}`);
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
