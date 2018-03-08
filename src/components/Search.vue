<template>
  <div v-click-away="hideDropdown" class="control omnibar">
    <input id="input" class="input" type="text" v-model="searchText" v-on:click="isActive = true" v-on:keyup.enter="search(searchText)"  placeholder="Search for a hash or filename...">
    <div v-if="isActive && history.length > 0" class="dropdown">
      <ul v-for="entry in history">
        <li v-on:click="search(entry)">{{ entry }}</li>
      </ul>
    </div>

    <div class="modal" v-bind:class="{'is-active': searching}">
      <div class="modal-background" v-on:click="closeModal()"></div>
      <div class="modal-content">
        <div class="box">
          <div class="field">
            <label class="label">Results</label>
            <div v-if="running">
              <span>Searching...</span>
            </div>
            <table v-else-if="files.length > 0" class="table">
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
                  <td><router-link v-bind:to="'/' + file.file_type + '/' + file.sha256_digest" append><span v-on:click="closeModal()">{{ file.name }}</span></router-link></td>
                  <td>{{ file.sha256_digest }}</td>
                  <td>{{ file.timestamp }}</td>
                  <td>
                    <tags :tags=file.tags></tags>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="table">
              <span>No results...</span>
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" v-on:click="closeModal()"></button>
    </div>
  </div>
</template>


<script>
import {API} from '@/config/config'
import Tags from '@/components/Tags'

export default {
  name: 'search',
  components: {
    'tags': Tags
  },

  data: () => ({
    isActive: false,
    searchText: '',

    files: [],
    errors: [],
    history: [],
    running: false,
    searching: false
  }),

  computed: {

  },

  created () {
    document.addEventListener('keyup', this.escapeKeyListener)
  },

  destroyed () {
    document.removeEventListener('keyup', this.escapeKeyListener)
  },

  directives: {
    'click-away': {
      bind (el, binding, vnode) {
        el.event = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event)
          }
        }
        el.addEventListener('click', 'click-away'.stopProp)
        document.body.addEventListener('click', el.event)
      },

      unbind (el, binding, vnode) {
        el.removeEventListener('click', 'click-away'.stopProp)
        document.body.removeEventListener('click', el.event)
      },

      stopProp (event) {
        event.stopPropagation()
      }
    }
  },

  methods: {
    pushHistory (entry) {
      if (entry === '') {
        return
      }
      if (this.history.indexOf(entry) !== -1) {
        return
      }
      this.history.unshift(entry)
      if (this.history.length > 5) {
        this.history.pop()
      }
    },

    closeModal: function () {
      this.searching = false
    },

    hideDropdown: function () {
      this.isActive = false
    },

    search: function (text) {
      document.getElementById('input').blur()
      this.isActive = false
      this.pushHistory(text)
      var filter =
        'filter[authentihash]={"$regex":"' + text + '$options": "-i"}&' +
        'filter[name]={"$regex":"' + text + '"}&' +
        'filter[tags]={"$regex":"' + text + '", "$options": "-i"}&' +
        'filter[imphash]=' + text + '&' +
        'filter[md5_digest]=' + text + '&' +
        'filter[pehash]=' + text + '&' +
        'filter[sha1_digest]=' + text + '&' +
        'filter[sha256_digest]=' + text + '&' +
        'filter[sha512_digest]=' + text + '&' +
        'operator=or'
      this.files = []
      this.running = true
      this.searching = true
      API.get('store?' + filter)
        .then(response => {
          var files = response.data['data']['store']
          this.files = files
          if (files.length === 1) {
            this.$router.push('/' + files[0].file_type + '/' + files[0].sha256_digest)
            this.searching = false
          }
          this.running = false
        })
        .catch(e => {
          this.pushError(e)
          this.running = false
        })
      this.searchText = ''
    },

    toggleActive: function () {
      this.isActive = !this.isActive
    },

    escapeKeyListener: function (evt) {
      if (evt.keyCode === 27 && this.searching) {
        this.closeModal()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
@import '../styles/settings.sass'

.omnibar
  margin: auto
  max-width: 600px
  min-width: 100px
  width: 100%
  .dropdown
    background-color: $white
    border: 1px solid $blue
    display: block
    position: absolute
    margin-top: -1px
    width: 100%
    z-index: 100
    li
      display: inline-block
      overflow: hidden
      text-overflow: ellipsis
      width: 100%
    ul
      padding: 0.5em
    ul:hover
      background-color: $blue
      color: $white

.modal-content
  width: 90%
  -o-user-select: text
  -moz-user-select: text
  -webkit-user-select: text
  user-select: text

td:first-child
  max-width: 10em

td > a
  display: inline-block
  overflow: hidden
  text-overflow: ellipsis
  width: 100%

</style>
