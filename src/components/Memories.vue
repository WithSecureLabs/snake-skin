<template>
  <div class="memories">

    <nav class="level">
      <div class="level-left">
        <h2 class="title">Memory Store</h2>
      </div>
      <div class="level-right">
        <div class="sort">
          <p>Sort:</p>
          <dropdown :name=activeSort :items=sort :onclick=setActiveSort></dropdown>
        </div>
        <div class="field has-addons">
          <p class="control">
            <input class="input" type="text" v-model="filter" v-on:keyup.enter="search(filter)"  placeholder="Filter...">
          </p>
          <p class="control">
            <button class="button" v-on:click="search(filter)">
              Filter
            </button>
          </p>
        </div>
      </div>
    </nav>

    <div v-if="running">
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
          <tr v-for="file in storePageData">
            <td><router-link v-bind:to="/memory/ + file.sha256_digest" append>{{ file.name }}</router-link></td>
            <td>{{ file.sha256_digest }}</td>
            <td>{{ file.timestamp }}</td>
            <td>
              <tags :tags=file.tags></tags>
            </td>
          </tr>
        </tbody>
      </table>
      <nav class="pagination" role="navigation" aria-label="pagination">
        <a class="pagination-previous" v-on:click="setStoreCurrentPage(page - 1)">Previous</a>
        <a class="pagination-next" v-on:click="setStoreCurrentPage(page + 1)">Next page</a>
        <ul class="pagination-list">
          <li>
            <a class="pagination-link" v-on:click="setStoreCurrentPage(1)" :class="{ 'is-current': page === 1 }">1</a>
          </li>
          <li v-if="storePages > 1">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li v-if="(page - 3) > 1">
            <a class="pagination-link" v-on:click="setStoreCurrentPage(page - 3)">{{ page - 3 }}</a>
          </li>
          <li v-if="(page - 2) > 1">
            <a class="pagination-link" v-on:click="setStoreCurrentPage(page - 2)">{{ page - 2 }}</a>
          </li>
          <li v-if="(page - 1) > 1">
            <a class="pagination-link" v-on:click="setStoreCurrentPage(page - 1)">{{ page - 1 }}</a>
          </li>
          <li v-if="page !== 1 & page !== storePages">
            <a class="pagination-link is-current" v-on:click="setStoreCurrentPage(page)" aria-current="page">{{ page }}</a>
          </li>
          <li v-if="(page + 1) < storePages">
            <a class="pagination-link" v-on:click="setStoreCurrentPage(page + 1)">{{ page + 1 }}</a>
          </li>
          <li v-if="(page + 2) < storePages">
            <a class="pagination-link" v-on:click="setStoreCurrentPage(page + 2)">{{ page + 2 }}</a>
          </li>
          <li v-if="(page + 3) < storePages">
            <a class="pagination-link" v-on:click="setStoreCurrentPage(page + 3)">{{ page + 3 }}</a>
          </li>
          <li v-if="storePages > 2">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li v-if="storePages > 1">
            <a class="pagination-link" v-on:click="setStoreCurrentPage(storePages)" :class="{ 'is-current': page === storePages }">{{ storePages }}</a>
          </li>
        </ul>
      </nav>
    </div>
    <div v-else>
      <span>No Memories Available...</span>
    </div>
  </div>
</template>


<script>
import Dropdown from '@/components/Dropdown'
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import Tags from '@/components/Tags'

export default {
  name: 'memories',
  components: {
    'dropdown': Dropdown,
    'tags': Tags
  },

  data: () => ({
    activeSort: 'Name',
    errors: [],
    filter: [],
    sort: [
      'Name',
      'Timestamp'
    ]
  }),

  computed: {
    ...mapGetters({
      storePages: 'memories/storePages',
      storePageData: 'memories/storePageData'
    }),

    ...mapState({
      files: state => state.memories.files,
      running: state => state.memories.running,

      // TEMP
      page: state => state.memories.currentPage,
      rows: state => state.memories.rows
    })
  },

  created () {
    this.initStore('memory')
    this.setStoreRows(15)
    this.getFiles()
  },

  methods: {
    ...mapActions({
      getFiles: 'memories/getFiles',
      getFilteredFiles: 'memories/getFilteredFiles',
      initStore: 'memories/initStore'
    }),

    ...mapMutations({
      setStoreCurrentPage: 'memories/setStoreCurrentPage',
      setStoreRows: 'memories/setStoreRows'
    }),

    setActiveSort: function (arg) {
      if (arg === this.activeSort) {
        return
      }
      this.activeSort = arg
      if (arg === 'Timestamp') {
        this.getFilteredFiles('sort=' + arg.toLowerCase())
      } else {
        this.getFiles()
      }
    },

    search: function (text) {
      this.getFilteredFiles(
        'filter[name]={"$regex":"' + text + '"}&' +
        'filter[tags]={"$regex":"' + text + '"}&' +
        'filter[sha256_digest]={"$regex":"' + text + '"}&' +
        'operator=or')
      this.searchText = ''
    }
  }
}
</script>


<style lang="sass" scoped>
.sort
  display: flex
  flex-flow: row
  padding-right: 0.5em
  p
    margin: auto
    padding-right: 0.5em
</style>
