<template>
  <div class="upload column">
    <div class="tabs is-toggle is-fullwidth">
      <ul>
        <li :class="{'is-active': fileType === 'file'}">
          <a v-on:click="changeFileType('file')">File</a>
        </li>
        <li :class="{'is-active': fileType === 'memory'}">
          <a v-on:click="changeFileType('memory')">Memory</a>
        </li>
      </ul>
    </div>
    <div class="tabs">
      <ul>
        <li :class="{'router-link-active': type === 'general'}">
          <a v-on:click="changeType('general')">General</a>
        </li>
        <li v-for="u in scaleNames('upload')" :class="{'router-link-active': type === u}">
          <a v-on:click="changeType(u)">{{ toCap(u) }}</a>
        </li>
      </ul>
    </div>

    <div class="columns">
      <div class="column form">
        <template v-if="type === 'general'">
          <label v-if="fileType === 'memory'" class="label">Memory (aff4, dmp, mdmp, raw, etc...)</label>
          <label v-else class="label">File (doc, exe, txt, etc...)</label>
          <div class="field file-picker has-addons">
            <div class="file">
              <label class="file-label">
                <input class="file-input" :class="{'is-danger' : checked && (file === '')}" type="file" name="resume" @change="processFile($event)">
                <span class="file-cta">
                  <span class="file-icon">
                    <icon name="upload"></icon>
                  </span>
                  <span class="file-label">
                    Choose a file...
                  </span>
                </span>
              </label>
            </div>
            <div class="f-name control">
              <input class="input" :class="{'is-danger' : checked && (name === '')}" type="text" v-model="name" placeholder="File Name">
            </div>
          </div>
        </template>
        <template v-else>
          <div v-for="arg in getArguments()" class="field">
            <label class="label">{{ toCap(arg) }}</label>
            <div class="control">
              <input class="input" type="text" v-model="$data.arguments[arg]" :placeholder="arg">
            </div>
          </div>

          <div class="field">
            <label class="label">Autoname</label>
            <div class="checkbox">
              <input type="checkbox" v-model="autoname" placeholder="Autoname">
              Allow Snake to autoname the file
            </div>
          </div>
        </template>

        <transition name="slide-fade">
          <div v-if="!autoname" class="field">
            <label class="label">Name</label>
            <div v-if="!autoname" class="control">
              <input class="input" type="text" v-model="name" placeholder="File Name">
            </div>
          </div>
        </transition>

        <div class="field">
          <label class="label">Archive</label>
          <div class="checkbox">
            <input type="checkbox" v-model="extract" placeholder="Extract">
            Extract file on upload
          </div>
        </div>

        <transition name="slide-fade">
        <template v-if="extract">
          <div class="field">
            <label class="label">Archive Password</label>
            <div class="control">
              <input class="input" type="text" v-model="password" placeholder="Archive Password">
            </div>
          </div>
        </template>
        </transition>

        <div class="field">
          <label class="label">Tags</label>
          <div class="control">
            <input class="input" type="text" v-model="tags" placeholder="File Tags">
          </div>
        </div>

        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <textarea class="input description" type="textarea" v-model="description" placeholder="File Description"></textarea>
          </div>
        </div>
      </div>

      <div class="column commands">
        <div class="field">
          <label class="label">Commands</label>
          <div>
            <div v-for="command in commands" class="field is-grouped">
              <input class="input" type="text" v-model="command['scale']" placeholder="File Tags" disabled=disabled>
              <input class="input" type="text" v-model="command['command']" placeholder="File Tags" disabled=disabled>
              <button class="button is-danger" v-on:click="removeCommand(command)">Remove</button>
            </div>
          </div>
          <div class="control is-grouped">
            <dropdown :name=selectedScaleCommand :items="scaleNames('commands')" :onclick=selectScaleCommand></dropdown>
            <dropdown :name=selectedCommand  :items=activeScaleCommands item_key="command" :onclick=selectCommand></dropdown>
            <button class="button is-primary" v-on:click="addCommand">Add</button>
          </div>
        </div>
        <div class="field">
          <label class="label">Interfaces</label>
          <div>
            <div v-for="push in pushers" class="field is-grouped">
              <input class="input" type="text" v-model="push['scale']" placeholder="File Tags" disabled=disabled>
              <input class="input" type="text" v-model="push['command']" placeholder="File Tags" disabled=disabled>
              <button class="button is-danger" v-on:click="removePusher(push)">Remove</button>
            </div>
          </div>
          <div class="control is-grouped">
            <dropdown :name=selectedScaleInterface :items="scaleNames('interface')" :onclick=selectScaleInterface></dropdown>
            <dropdown :name=selectedPusher  :items=activeScaleInterfacePushers item_key="command" :onclick=selectPusher></dropdown>
            <button class="button is-primary" v-on:click="addPusher">Add</button>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary" :disabled="uploading || (type === 'general' && (fileType === '' || name === '' || file === ''))" v-on:click="upload">Submit</button>
        </div>
      </div>
    </div>

    <div class="modal" :class="{'is-active': uploading }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box" style="text-align: center;">
        <h2>Uploading...</h2>
        </div>
      </div>
    </div>
    <div class="modal" :class="{'is-active': path !== ''}">
      <div class="modal-background" v-on:click="closeModal"></div>
      <div class="modal-content">
        <div class="box" style="text-align: center;">
        <h2>File has already been uploaded...</h2>
        <a class="button is-primary" :href="path">Proceed</a>
        </div>
      </div>
      <button class="modal-close is-large" v-on:click="closeModal"></button>
    </div>
    <div class="modal" :class="{'is-active': errors.length > 0}">
      <div class="modal-background" v-on:click="errors = []"></div>
      <div class="modal-content">
        <div class="box">
          <h2 class="subtitle">Error uploading sample...</h2>
          <pre v-for="err in errors">{{ err }}</pre>
          <a class="button is-primary" v-on:click="errors = []">Close</a>
        </div>
      </div>
      <button class="modal-close is-large" v-on:click="errors = []"></button>
    </div>
  </div>
</template>


<script>
import {API_URL} from '@/config/config'
import {mapActions, mapGetters, mapState} from 'vuex'
import axios from 'axios'
import Dropdown from '@/components/Dropdown'
import 'vue-awesome/icons/upload'
import Icon from 'vue-awesome/components/Icon'

const HTTP = axios.create({
  baseURL: API_URL,
  headers: {
    'Access-Control-Allow-Origin': API_URL
  },
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || (status === 409)
  }
})

export default {
  name: 'app-upload',
  components: {
    Icon,
    'dropdown': Dropdown
  },

  data: () => ({
    arguments: {}, // Arguments to send in a request
    autoname: true,
    description: '',
    extract: false,
    file: '',
    name: '',
    password: '',
    tags: '',
    fileType: 'file',
    type: 'general',

    activeScaleCommand: {},
    activeScaleInterface: {},
    activeScaleCommands: [],
    activeScaleInterfacePushers: [],
    commands: [],
    pushers: [],
    selectedCommand: 'Commands',
    selectedPusher: 'Pushers',
    selectedScaleCommand: 'Scales',
    selectedScaleInterface: 'Scales',

    checked: false,
    errors: [],
    path: '',
    uploading: false
  }),

  computed: {
    ...mapGetters({
      scaleCommands: 'scales/commands',
      scaleNames: 'scales/scaleNames',
      uploadDict: 'scales/upload'
    }),

    ...mapState({
      scales: state => state.scales.scales,
      scaleInterface: state => state.scales.interfaces
    })
  },

  created () {
    this.initScalesStore(this.fileType)
  },

  methods: {
    ...mapActions({
      getScales: 'scales/getScales',
      initScalesStore: 'scales/initScalesStore'
    }),

    addCommand (event) {
      if (this.selectedScaleCommand !== 'Scales' && this.selectedCommand !== 'Commands') {
        this.commands.push({'scale': this.selectedScaleCommand, 'command': this.selectedCommand})
      }
    },

    addPusher (event) {
      if (this.selectedScaleInterface !== 'Scales' && this.selectedPusher !== 'Pushers') {
        this.pushers.push({'scale': this.selectedScaleInterface, 'command': this.selectedPusher})
      }
    },

    changeFileType (type) {
      this.fileType = type
      this.getScales(type)
    },

    changeType (type) {
      this.type = type
    },

    closeModal (event) {
      this.path = ''
    },

    getArguments () {
      var d = this.uploadDict(this.type)
      if (typeof d['args'] !== 'undefined') {
        return Object.keys(d['args'])
      }
      return []
    },

    processFile (event) {
      this.file = event.target.files[0]
      this.name = this.file.name
    },

    removeCommand (command) {
      var index = this.commands.indexOf(command)
      if (index !== -1) {
        this.commands.splice(index, 1)
      }
    },

    removePusher (pusher) {
      var index = this.pushers.indexOf(pusher)
      if (index !== -1) {
        this.pushers.splice(index, 1)
      }
    },

    selectCommand (command) {
      this.selectedCommand = command.command
    },

    selectPusher (pusher) {
      this.selectedPusher = pusher.command
    },

    selectScaleCommand (scaleName) {
      this.activeScaleCommand = this.scales[scaleName]
      this.activeScaleCommands = this.scaleCommands(scaleName)
      this.selectedScaleCommand = scaleName
      this.selectedCommand = 'Commands'
    },

    selectScaleInterface (scaleName) {
      this.activeScaleInterface = this.scales[scaleName]
      this.activeScaleInterfacePushers = this.scaleInterface[scaleName]['pushers']
      this.selectedScaleInterface = scaleName
      this.selectedPusher = 'Pushers'
    },

    toCap (name) {
      return name.charAt(0).toUpperCase() + name.slice(1)
    },

    upload (context) {
      var config = {}
      var data
      var url
      if (this.type === 'general') { // Setup for general (multipart/form-data)
        if (this.fileType === '' ||
            this.name === '' ||
            this.file === '') {
          return
        }
        url = 'upload/' + this.fileType
        data = new FormData()
        data.append('file', this.file)
        data.append('name', this.name)
        data.append('tags', this.tags)
        data.append('description', this.description)
        data.append('file_type', this.fileType)
        if (this.extract) {
          data.append('extract', this.extract)
          if (this.password !== '') {
            data.append('password', this.password)
          }
        }
        config['headers'] = { 'content-type': 'multipart/form-data' }
      } else { // Setup for scales (json)
        url = 'scale/' + this.type + '/upload'
        data = {
          'args': this.arguments,
          'description': this.description,
          'file_type': this.fileType,
          'tags': this.tags
        }
        if (!this.autoname) {
          data['name'] = this.name
        }
        if (this.extract) {
          data['extract'] = this.extract
          if (this.password !== '') {
            data['password'] = this.password
          }
        }
      }

      this.uploading = true

      HTTP.post(url, data, config)
        .then(response => {
          var sha256Digest = response.data['data'][this.fileType]['sha256_digest']
          if (response.status === 409) {
            // 409 means that the file already exists, we can extract the SHA256
            // from the error message
            this.path = '#/' + this.fileType + '/' + sha256Digest
          } else {
            if (this.commands.length > 0) {
              var cmds = []
              for (var i in this.commands) {
                var cmd = this.commands[i]
                cmd['sha256_digests'] = [sha256Digest]
                cmd['asynchronous'] = true
                cmds.push(cmd)
              }
              HTTP.post('commands', cmds)
                .then(response => {
                  console.log(response)
                })
                .catch(e => {
                  console.log(e)
                })
            }
            if (this.pushers.length > 0) {
              for (i in this.pushers) {
                cmd = this.pushers[i]
                var data = {
                  'command': cmd['command'],
                  'sha256_digest': sha256Digest,
                  'type': 'push'
                }
                HTTP.post('scale/' + cmd['scale'] + '/interface', data)
                  .then(response => {
                    console.log(response)
                  })
                  .catch(e => {
                    console.log(e)
                  })
              }
            }
            this.$router.push('/' + this.fileType + '/' + sha256Digest)
            this.uploading = false
          }
        })
        .catch(e => {
          this.errors.push(e.response.data)
          this.uploading = false
        })
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

ul > li.router-link-active > a
  border-bottom-color: $blue
  border-bottom-style: solid
  border-bottom-width: 1px
  color: $blue
  margin-bottom: -1px

.columns
  display: flex
  .column
    padding-bottom: 1em
    padding-left: 0.5em
    padding-right: 0.5em
  .column:first-child
    padding-left: 0em
  .column:last-child
    padding-right: 0em

.commands
  width: 50%

.description
  height: 80px

.file-picker
  .file-cta
    border-top-right-radius: 0
    border-bottom-right-radius: 0
  .f-name
    margin-left: -1px
    width: 100%

.form
  width: 50%

.slide-fade-enter-active, .slide-fade-leave-active
  transition: all .3s ease

.slide-fade-enter, .slide-fade-leave-to
  transform: translateY(-10px)
  opacity: 0

.upload
  text-align: left
</style>
