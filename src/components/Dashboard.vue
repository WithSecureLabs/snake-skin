<template>
  <div class="dashboard column">
    <h1 class="title">Recent Files</h1>
    <div v-if="files_running">
      <span>Loading...</span>
    </div>
    <div v-else-if="files.length > 0">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SHA 256</th>
            <th>Time Submitted</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="file in files">
            <td><router-link v-bind:to="/file/ + file.sha256_digest" append>{{ file.name }}</router-link></td>
            <td>{{ file.sha256_digest }}</td>
            <td>{{ file.timestamp }}</td>
            <td>
              <tags :tags=file.tags></tags>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <span>No Files Available...</span>
    </div>

    <h1 class="title">Recent Memories</h1>
    <div v-if="memories_running">
      <span>Loading...</span>
    </div>
    <div v-else-if="files.length > 0">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SHA 256</th>
            <th>Time Submitted</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="memory in memories">
            <td><router-link v-bind:to="/memory/ + memory.sha256_digest" append>{{ memory.name }}</router-link></td>
            <td>{{ memory.sha256_digest }}</td>
            <td>{{ memory.timestamp }}</td>
            <td>
              <tags :tags=memory.tags></tags>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <span>No Memories Available...</span>
    </div>
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import Tags from '@/components/Tags'

export default {
  name: 'dashboard',
  components: {
    'tags': Tags
  },

  computed: {
    ...mapState({
      files: state => state.files.files,
      files_running: state => state.files.running,
      memories: state => state.memories.files,
      memories_running: state => state.memories.running
    })
  },

  created () {
    this.$store.dispatch('files/initStore', 'file')
    this.$store.dispatch('memories/initStore', 'memory')
    this.$store.dispatch('files/getRecentFiles')
    this.$store.dispatch('memories/getRecentFiles')
  },

  methods: {
    ...mapActions([
      'files/getRecentFiles',
      'files/initStore',
      'memories/getRecentFiles',
      'memories/initStore'
    ])
  }
}
</script>


<style scoped>
.table {
  width: 100%;
}
</style>
