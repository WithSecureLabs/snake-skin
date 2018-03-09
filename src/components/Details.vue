<template>
  <div class="detail">
    <div class="content">
        <div class="column">
          <h2 class="subtitle">Summary</h2>
          <nav class="panel">
            <div class="panel-block">
              <table class="table">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td v-if="file" class="level">
                        <div class="level-left">
                          <p>{{ file.name }}</p>
                        </div>
                        <div class="level-right">
                          <a class="button is-primary is-small is-outlined" v-on:click="newName = file.name; editingName = true">Edit</a>
                        </div>
                    </td>
                  </tr>
                  <tr>
                    <th>Size</th>
                    <td v-if="file">{{ Math.ceil(file.size / 100) / 10 }} Kb</td>
                  </tr>
                  <tr>
                    <th>Magic</th>
                    <td v-if="file">{{ file.magic }}</td>
                  </tr>
                  <tr>
                    <th>MIME</th>
                    <td v-if="file">{{ file.mime }}</td>
                  </tr>
                  <tr>
                    <th>Uploaded Time</th>
                    <td v-if="file">{{ file.timestamp }}</td>
                  </tr>
                  <tr>
                    <th>SHA256 Digest</th>
                    <td v-if="file">{{ file.sha256_digest }}</td>
                  </tr>
                  <tr>
                    <th>Submission Type</th>
                    <td v-if="file">
                      <tags v-if="file.submission_type.length > 0" :tags=[file.submission_type]></tags>
                      <span v-else>N/A</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Tags</th>
                    <td v-if="file" class="level">
                        <div class="level-left">
                          <tags :tags=file.tags></tags>
                        </div>
                        <div class="level-right">
                          <a class="button is-primary is-small is-outlined" v-on:click="newTags = file.tags; editingTags = true">Edit</a>
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </nav>
          <div v-if="file && Object.keys(file.parents).length > 0">
            <h2 class="subtitle">Parents</h2>
            <table class="table no-fixed-table">
              <thead>
                <tr>
                  <th>Parent (SHA256 Digest)</th>
                  <th>Submission Types</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="parent in Object.keys(file.parents)">
                  <td>
                    <a class="no-break" :href="'/#/sample/' + parent">{{ parent }}</a>
                  </td>
                  <td>
                    <tags :tags=file.parents[parent]></tags>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="file && Object.keys(file.children).length > 0">
            <h2 class="subtitle">Children</h2>
            <table class="table no-fixed-table">
              <thead>
                <tr>
                  <th>Child (SHA256 Digest)</th>
                  <th>Submission Types</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="child in Object.keys(file.children)">
                  <td>
                    <a class="no-break" :href="'/#/sample/' + child">{{ child }}</a>
                  </td>
                  <td>
                    <tags :tags=file.children[child]></tags>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="hex !== ''">
            <h2 class="subtitle">Hexdump</h2>
            <nav class="panel">
              <div class="panel-block">
                <pre>{{ hex }}</pre>
              </div>
            </nav>
          </div>
        </div>

        <div class="column description">
          <h2 class="subtitle">Description</h2>
          <nav class="panel">
            <div class="panel-block">
              <div style="width:100%;">
                <pre v-if="(typeof file['description'] === 'undefined' || file.description === '')">No Description!</pre>
                <pre v-else>{{ file.description }}</pre>
                <div class="level">
                  <div class="level-left"></div>
                  <div class="level-right">
                    <a class="button is-primary is-small is-outlined" v-on:click="newDescription = file.description; editingDescription = true">Edit</a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <template v-for="scale in scaleNames('interface')">
            <h2 class="subtitle">{{ toCap(scale) }}</h2>
            <nav class="panel">
              <div class="panel-block">
                <pre v-if="typeof info[scale] === 'undefined'">Loading...</pre>
                <div v-else v-html="renderMarkdown(info[scale])" class="markdown"></div>
              </div>
            </nav>
          </template>
      </div>
    </div>

    <div class="modals">
      <div class="modal" v-bind:class="{'is-active': editingDescription}">
        <div class="modal-background" v-on:click="editingDescription = false"></div>
        <div class="modal-content">
          <div class="box">
            <div class="field">
              <label class="label">Description</label>
              <div class="control">
                <textarea class="textarea" v-model="newDescription" placeholder="Description"></textarea>
              </div>
            </div>
            <div class="level">
              <div class="level-left"></div>
              <div class="level-right">
                <a class="button is-primary" v-on:click="saveDescription()">Save</a>
              </div>
            </div>
          </div>
        </div>
        <button class="modal-close is-large" v-on:click="editingDescription = false"></button>
      </div>
      <div class="modal" v-bind:class="{'is-active': editingName}">
        <div class="modal-background" v-on:click="editingName = false"></div>
        <div class="modal-content">
          <div class="box">
            <div class="field">
              <label class="label">Name</label>
              <div class="control">
                <textarea class="textarea" v-model="newName" placeholder="Name"></textarea>
              </div>
            </div>
            <div class="level">
              <div class="level-left"></div>
              <div class="level-right">
                <a class="button is-primary" v-on:click="saveName()">Save</a>
              </div>
            </div>
          </div>
        </div>
        <button class="modal-close is-large" v-on:click="editingName = false"></button>
      </div>
      <div class="modal" v-bind:class="{'is-active': editingTags}">
        <div class="modal-background" v-on:click="editingTags = false"></div>
        <div class="modal-content">
          <div class="box">
            <div class="field">
              <label class="label">Tags</label>
              <div class="control">
                <textarea class="textarea" v-model="newTags" placeholder="Tags"></textarea>
              </div>
            </div>
            <div class="level">
              <div class="level-left"></div>
              <div class="level-right">
                <a class="button is-primary" v-on:click="saveTags()">Save</a>
              </div>
            </div>
          </div>
        </div>
        <button class="modal-close is-large" v-on:click="editingTags = false"></button>
      </div>
    </div>
  </div>
</template>


<script>
import { API } from '@/config/config'
import { mapActions, mapGetters, mapState } from 'vuex'
import Tags from '@/components/Tags'
import Vue from 'vue'

var marked = require('marked-pax')
var renderer = new marked.Renderer()

renderer.color = function (color, text) {
  if (color === 'green') {
    // SASS: cc-greenblue
    color = 'rgb(36, 200, 148)'
  }
  if (color === 'yellow') {
    // SASS: cc-pumpkin
    color = 'rgb(237, 137, 0)'
  }
  if (color === 'red') {
    // SASS: cc-faded-red
    color = 'rgb(218, 68, 83)'
  }
  return '<span style="color:' + color + '">' + text + '</span>'
}

export default {
  name: 'detail',
  components: {
    'tags': Tags
  },

  data: () => ({
    editingDescription: false,
    editingName: false,
    editingTags: false,
    errors: [],
    info: {},
    newDescription: '',
    newName: '',
    newTags: ''
  }),

  computed: {
    ...mapGetters({
      scaleNames: 'scales/scaleNames'
    }),

    ...mapState({
      file: state => state.file.file,
      hex: state => state.file.hex,
      interfaces: state => state.scales.interfaces
    })
  },

  mounted () {
    this.load()
  },

  methods: {
    ...mapActions({
      initScalesStore: 'scales/initScalesStore',
      patchFile: 'file/patchFile'
    }),

    load () {
      var scaleNames = this.scaleNames('interface')
      for (var s in scaleNames) {
        this.pullInterfaceInfo(scaleNames[s])
      }
    },

    pullInterfaceInfo (scale) {
      if (typeof this.file.sha256_digest === 'undefined') {
        return
      }
      var url = 'scale/' + scale + '/interface'
      var data = {
        'sha256_digest': this.file.sha256_digest,
        'type': 'pull',
        'format': 'markdown',
        'command': 'info'
      }
      API.post(url, data)
        .then(response => {
          var intf = response.data['data']['interface']
          Vue.set(this.info, scale, intf)
        })
        .catch(e => {
          this.errors.push(e)
          if (typeof e.response === 'undefined') {
            Vue.set(this.info, scale, e.message)
          } else {
            Vue.set(this.info, scale, e.response.data.message)
          }
        })
    },

    renderMarkdown (md) {
      return marked(md, { renderer: renderer })
    },

    saveDescription: function () {
      this.patchFile({'description': this.newDescription})
      this.editingDescription = false
    },

    saveName: function () {
      this.patchFile({'name': this.newName})
      this.editingName = false
    },

    saveTags: function () {
      this.patchFile({'tags': this.newTags})
      this.editingTags = false
    },

    toCap (name) {
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  },

  watch: {
    interfaces () {
      this.load()
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

pre
  padding: 0

table
  margin-bottom: 0px
  table-layout: fixed
  th
    padding-top: 0.3em
    padding-bottom: 0.3em
    width: 140px
    word-wrap: break-word
  td
    padding-top: 0.3em
    padding-bottom: 0.3em
    word-break: break-all
    word-wrap: break-word
  td:last-child
    padding-right: 0

.column
  display: flex
  flex: 1 1 0
  flex-direction: column
  padding: 0
  padding-top: 1.5em
.column:first-child
  padding-top: 0

.content
  display: flex
  flex: 1 1 0
  flex-direction: row
  flex-wrap: wrap

@media screen and (min-width: 1000px)
  .detail
    flex-wrap: nowrap
  .column
    padding-bottom: 0
    padding-top: 0
    padding-left: 0.5em
    padding-right: 0.5em
  .column:first-child
    padding-left: 0em
  .column:last-child
    padding-right: 0em

.description
  width: 100%

.level-left
  flex-shrink: 1

.markdown
  width: 100%

.panel-tabs
  justify-content: left

.row
  display: flex

.no-break
  word-break: normal

.no-fixed-table
  table-layout: auto

.subtitle
  margin-bottom: 0.5em

</style>

