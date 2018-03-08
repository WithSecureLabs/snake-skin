<template>
  <div class="analysis">
    <nav class="panel">

      <div class="panel-tabs module-tabs">
        <dropdown name="Scales" :items="scaleNames('commands')" :onclick=selectScale></dropdown>
        <a v-for="name in activeScales" :class="{ 'is-active': scale === name }" v-on:click="selectScale(name)">{{ name }}</a>
      </div>

      <div class="panel-block">
        <template v-if="scale === ''">
          <h2 class="no-select">No Scale Selected!</h2>
        </template>
        <template v-else>
          <div class="analysis-sidebar">
            <h3 class="subtitle">Command List</h3>
            <ul>
              <template v-for="cmd in commandsList(scale)">
                <li :class="{ 'is-active': cmd.command === commandName}">
                  <span class="icon is-small">
                    <icon v-if="isPending(cmd.command)" name="ellipsis-h" class="fa" aria-hidden="true"></icon>
                    <icon v-if="isRunning(cmd.command)" name="circle-o-notch" class="fa" aria-hidden="true" spin></icon>
                    <icon v-if="isSuccess(cmd.command)" name="check" class="fa" aria-hidden="true"></icon>
                    <icon v-if="isFailed(cmd.command)" name="times" class="fa" aria-hidden="true"></icon>
                  </span>
                  <a class="name" v-on:click="selectCommand(cmd)">{{ cmd.command }}</a>
                  <span class="level-right">
                    <popper :options="{placement: 'bottom'}">
                      <div class="popper">
                        <div class="padding-small">
                          <span>{{ cmd.info }}</span>
                        </div>
                      </div>
                      <span slot="reference">
                        <icon name="info-circle" class="icon fa" aria-hidden="true"></icon>
                      </span>
                    </popper>
                    <span slot="reference">
                      <button :disabled="isPending(cmd.command) || isRunning(cmd.command)" v-on:click="runCommand({'sha256_digest' : sha256Digest, 'scale': scale, 'command': cmd.command})">
                        <icon name="play-circle" class="icon fa" aria-hidden="true"></icon>
                      </button>
                    </span>
                  </span>
                </li>
              </template>
            </ul>
          </div>

          <div class="command">
            <nav class="level">
              <div class="level-left">
                <template v-if="commandIndex !== -1">
                  <span>Format:</span>
                  <dropdown :name="format" :items="commandsList(scale)[commandIndex]['formats']" :onclick=changeFormat></dropdown>
                </template>
                <div class="padding-small" @click="toggleShowArguments">
                  <a>Toggle Arguments</a>
                </div>
              </div>
              <div class="level-right">
                <popper :options="{placement: 'bottom'}">
                  <div class="popper">
                    <div class="padding-small">
                      <ul>
                        <li v-if="commandStartTime(commandName)">Start Time: {{ commandStartTime(commandName) }}</li>
                        <li v-else>Start Time: Not Run</li>
                        <li v-if="commandEndTime(commandName)">End Time: {{ commandEndTime(commandName) }}</li>
                        <li v-else>End Time: Not Run</li>
                      </ul>
                    </div>
                  </div>
                  <div slot="reference">
                    <span v-if="commandTimestamp(commandName)">Submitted Time: {{ commandTimestamp(commandName) }}</span>
                    <span v-else>Submitted Time: Not Run</span>
                  </div>
                </popper>
              </div>
            </nav>
            <div v-show="showArguments" class="card padding-small">
              <div class="field">
                <label class="label">Timeout</label>
                <div class="control">
                  <input class="input" type="text" v-model="timeout" placeholder="600">
                </div>
              </div>
              <div v-for="arg in getArguments()" class="field">
                <label class="label">{{ toCap(arg) }}</label>
                <div class="control">
                  <input class="input" type="text" v-model="$data.arguments[arg]" :placeholder="'Enter ' + arg">
                </div>
              </div>
            </div>
            <div class="output padding-small">
              <div v-if="isMarkdown(commandName)" v-html="renderMarkdown(commandName)" class="markdown"></div>
              <pre v-else class="markdown">{{ commandOutput(commandName) }}</pre>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </div>
</template>


<script>
import { API } from '@/config/config'
import { mapGetters, mapMutations, mapState } from 'vuex'
import Dropdown from '@/components/Dropdown'
import 'vue-awesome/icons/check'
import 'vue-awesome/icons/circle-o-notch'
import 'vue-awesome/icons/ellipsis-h'
import 'vue-awesome/icons/info-circle'
import 'vue-awesome/icons/play-circle'
import 'vue-awesome/icons/times'
import Icon from 'vue-awesome/components/Icon'
import Popper from 'vue-popperjs'
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
  name: 'analysis',
  components: {
    Icon,
    'dropdown': Dropdown,
    'popper': Popper
  },

  data: () => ({
    arguments: {}, // Arguments to send in a request
    commands: {}, // Executed commands for the given file and scale {'cmd': data}
    commandName: '', // Command name
    errors: [], // Store axios errors
    format: 'json',
    formats: [ // Format ordering, we are a UI so JSON is not preferred
      'markdown',
      'plaintext',
      'json'
    ],
    polling: false,
    showArguments: false, // Used to toggle the display of arguments if the command supports them
    timeout: ''
  }),

  mounted () {
    this.load()
  },

  computed: {
    ...mapGetters({
      commandsList: 'scales/commands',
      scaleNames: 'scales/scaleNames'
    }),

    ...mapState({
      commandIndex: state => state.file.activeCommandIndex, //
      scale: state => state.file.activeCommandScale, // Persist currently selected scale
      activeScales: state => state.file.commandScales, // Persist active scales
      file: state => state.file.file, // Access the selected file
      sha256Digest: state => state.file.sha256Digest // Get hash for file
    })
  },

  methods: {
    ...mapMutations({
      setCommandIndex: 'file/setActiveCommandIndex',
      activateScale: 'file/setActiveCommandScale'
    }),

    load () {
      if (this.scale !== '') {
        this.getCommands({
          'sha256_digest': this.sha256Digest,
          'scale': this.scale
        })
        if (this.commandIndex !== -1) {
          this.selectCommand(this.commandsList(this.scale)[this.commandIndex])
        }
      }
    },

    changeFormat (format) {
      this.format = format
      var data = {
        'sha256_digest': this.sha256Digest,
        'scale': this.scale,
        'command': this.commandName,
        'format': format
      }
      this.getCommand(data)
    },

    selectCommand (command) {
      this.commandName = command.command
      this.setCommandIndex(this.commandsList(this.scale).indexOf(command))
      this.arguments = this.commandArguments(this.commandName)
      this.showArguments = false
      if (typeof this.arguments === 'undefined') {
        this.arguments = {}
      }
      if (this.commandFormat(this.commandName) === '') {
        this.format = this.supportedFormats(this.scale, this.commandName)[0]
      } else {
        this.format = this.commandFormat(this.commandName)
      }
      if (this.commandTimeout(this.commandName) === -1) {
        this.timeout = undefined
      } else {
        this.timeout = this.commandTimeout(this.commandName)
      }
    },

    selectFormat (format) {
      this.format = format
    },

    selectScale (scaleName) {
      this.activateScale(scaleName)
      this.commands = {}
      this.commandName = ''
      this.showArguments = false
      this.getCommands({
        'sha256_digest': this.sha256Digest,
        'scale': scaleName
      })
      this.selectCommand(this.commandsList(this.scale)[this.commandIndex])
    },

    supportedFormats (scaleName, commandName) {
      var fmts = []
      var list = this.commandsList(scaleName)
      for (var i in list) {
        var c = list[i]
        if (c.command === commandName) {
          fmts = c.formats
          break
        }
      }
      // Custom sort based on preference
      var formats = []
      for (i in this.formats) {
        if (fmts.indexOf(this.formats[i]) !== -1) {
          formats.push(this.formats[i])
        }
      }
      for (i in fmts) {
        if (formats.indexOf(fmts[i]) === -1) {
          formats.push(fmts[i])
        }
      }
      return formats
    },

    toggleShowArguments () {
      this.showArguments = !this.showArguments
    },

    getCommand (data) {
      if (typeof data.sha256_digest === 'undefined' ||
          typeof data.scale === 'undefined' ||
          typeof data.command === 'undefined') {
        return
      }
      if (typeof data.format === 'undefined') {
        data['format'] = this.format
      }
      if (this.commandName !== data.command) {
        data['format'] = this.supportedFormats(data.scale, data.command)[0]
      }
      var url = 'command?format=' + data.format + '&sha256_digest=' + data.sha256_digest + '&scale=' + data.scale + '&command=' + data.command
      API.get(url)
        .then(response => {
          var command = response.data['data']['command']
          this.setCommand(command)
          if (command['status'] === 'pending' || command['status'] === 'running') {
            this.pollCommands(data)
          }
        })
        .catch(e => {
          console.log(e.response.data)
          this.errors.push(e)
        })
    },

    getCommands (data) {
      // TODO: Cleanup and robust/improve
      if (typeof data.sha256_digest === 'undefined' || typeof data.scale === 'undefined') { return }
      if (typeof data.format === 'undefined') { data['format'] = 'json' }
      var url = 'commands?format=' + data.format + '&sha256_digest=' + data.sha256_digest + '&scale=' + data.scale
      API.get(url)
        .then(response => {
          var poll = false
          var commands = response.data['data']['commands']
          for (var i in commands) {
            // Set format if not found
            var cmd = commands[i]
            if (typeof this.commands[cmd] === 'undefined') {
              var fmts = this.supportedFormats(data.scale, cmd.command)
              for (var fmt in fmts) {
                if (fmts.indexOf(this.formats[fmt]) !== -1) {
                  cmd.format = this.formats[fmt]
                  this.getCommand({
                    'command': cmd.command,
                    'format': cmd.format,
                    'sha256_digest': cmd.sha256_digest,
                    'scale': cmd.scale
                  })
                  break
                }
              }
            } else {
              Vue.set(this.commands, cmd.command, cmd)
            }
            if (commands[i]['status'] === 'pending' || commands[i]['status'] === 'running') { poll = true }
          }
          // Poll any pending/running commands
          if (poll) {
            this.pollCommands(data)
          }
        })
        .catch(e => {
          this.errors.push(e)
        })
    },

    pollCommands (data) {
      // TODO: Axios does not support GET with body so we just get all of the
      // commands for a scale :/ YAY assumptions!
      // XXX: We poll in json to ensure that all commands are received but this
      // means we have to do extra work to get the desired format
      if (typeof data.sha256_digest === 'undefined' || typeof data.scale === 'undefined') { return }
      if (typeof data.format === 'undefined') { data['format'] = 'json' }
      if (this.polling) { return }
      this.polling = true
      API.get('commands?format=json&sha256_digest=' + data.sha256_digest + '&scale=' + data.scale)
        .then(response => {
          var c, i
          var cmds = []
          for (var key in this.commands) {
            c = this.commands[key]
            if (c['status'] === 'pending' || c['status'] === 'running') { cmds.push(c['command']) }
          }
          var commands = response.data['data']['commands']
          for (i in commands) {
            var command = commands[i]
            if (cmds.indexOf(command['command']) !== -1 &&
                command['status'] !== this.commands[command['command']]['status']) {
              this.commands[command['command']]['status'] = command['status']
              if (command['status'] !== 'pending' && command['status'] !== 'running') {
                this.getCommand({
                  'command': command.command,
                  'format': this.commands[command.command].format,
                  'sha256_digest': command.sha256_digest,
                  'scale': command.scale
                })
              }
            }
          }
          this.polling = false
          for (i in this.commands) {
            c = this.commands[i]
            if (c['status'] === 'pending' || c['status'] === 'running') {
              setTimeout(() => { this.pollCommands(data) }, 5000)
              return
            }
          }
        })
        .catch(e => {
          this.polling = false
          this.errors.push(e)
          console.log(e)
        })
    },

    runCommand (data) {
      if (typeof data.sha256_digest === 'undefined' ||
          typeof data.scale === 'undefined' ||
          typeof data.command === 'undefined') {
        return
      }
      if (typeof data.format === 'undefined') {
        data['format'] = this.format
      }
      if (this.commandName !== data.command) {
        data['format'] = this.supportedFormats(data.scale, data.command)[0]
      }
      var d = {
        'sha256_digest': data.sha256_digest,
        'scale': data.scale,
        'format': data.format,
        'command': data.command,
        'asynchronous': 'true'
      }
      if (this.timeout !== '') {
        d['timeout'] = this.timeout
      }
      if (Object.keys(this.arguments).length) {
        d['args'] = this.arguments
        // Delete empty keys
        Object.keys(d.args).forEach((key) => (d.args[key] === '') && delete d.args[key])
      }
      API.post('command', d)
        .then(response => {
          this.setCommand(response.data['data']['command'])
          if (response.data['data']['command']['status'] === 'pending' ||
              response.data['data']['command']['status'] === 'running') {
            this.pollCommands(data)
          }
        })
        .catch(e => {
          Vue.set(this.commands, data['command'], {
            'sha256_digest': data['sha256_digest'],
            'scale': data['scale'],
            'args': data['args'],
            'command': data['command'],
            'output': e.response.data['message'],
            'format': 'plaintext',
            'status': 'pending'
          })
        })
    },

    setCommand (command) {
      Vue.set(this.commands, command['command'], command)
    },

    // Helper functions
    commandArguments (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return {}
      }
      if (this.commands[commandName].args === null) {
        return {}
      }
      return this.commands[commandName].args
    },

    commandFormat (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return ''
      }
      return this.commands[commandName].format
    },

    commandOutput (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return ''
      }
      return this.commands[commandName].output
    },

    commandStatus (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return ''
      }
      return this.commands[commandName].status
    },

    commandTimeout (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return -1
      }
      return this.commands[commandName].timeout
    },

    commandTimestamp (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return ''
      }
      return new Date(this.commands[commandName].timestamp).toUTCString()
    },

    commandStartTime (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return ''
      }
      return new Date(this.commands[commandName].start_time).toUTCString()
    },

    commandEndTime (commandName) {
      if (typeof this.commands[commandName] === 'undefined') {
        return ''
      }
      return new Date(this.commands[commandName].end_time).toUTCString()
    },

    getArguments () {
      if (this.commandIndex === -1) {
        return []
      }
      var cmds = this.commandsList(this.scale)
      if (!cmds.length) {
        return []
      }
      var args = cmds[this.commandIndex]['args']
      if (args === null) {
        return []
      }
      return Object.keys(args)
    },

    hasArguments () {
      if (this.commandIndex === -1) {
        return false
      }
      var cmds = this.commandsList(this.scale)
      if (!cmds.length) {
        return false
      }
      var args = cmds[this.commandIndex]['args']
      if (args === null) {
        return false
      }
      if (Object.keys(args).length) {
        return true
      }
      return false
    },

    isFailed (commandName) {
      if (this.commandStatus(commandName) === 'failed') {
        return true
      }
      return false
    },

    isMarkdown (commandName) {
      if (this.commandFormat(commandName) === 'markdown') {
        return true
      }
      return false
    },

    isPending (commandName) {
      if (this.commandStatus(commandName) === 'pending') {
        return true
      }
      return false
    },

    isRunning (commandName) {
      if (this.commandStatus(commandName) === 'running') {
        return true
      }
      return false
    },

    isSuccess (commandName) {
      if (this.commandStatus(commandName) === 'success') {
        return true
      }
      return false
    },

    renderMarkdown (commandName) {
      if (this.commandOutput(commandName) === null) {
        return marked('', { renderer: renderer })
      } else {
        return marked(this.commandOutput(commandName), { renderer: renderer })
      }
    },

    toCap (name) {
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  },

  watch: {
    file () {
      this.load()
    },

    sha256Digest () {
      this.load()
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'
@import '../styles/vue-popper.css'

.card
  box-shadow: 0 0px 0px rgba(46, 46, 46, 0.1), 0 0 0 1px rgba(46, 46, 46, 0.1)

.dropdown
  padding: 3px

.panel
  display: block
  height: 100%

.panel-block
  padding: 0

.panel-tabs
  justify-content: left

.command
  height: 80vh
  width: calc(100% * 1 - 15rem)
  .level
    height: 45px
    margin-bottom: 0
    padding-left: 0.5em
    padding-right: 0.5em
  .output
    max-height: calc(100% * 1 - 45px)
    max-width: 100%
    overflow: auto

.info
  display: block
  margin: 0
  padding: 0

.name
  flex: 1
  overflow: hidden
  text-overflow: ellipsis

.no-select
  padding: 1em
  text-align: center
  width: 100%

.padding-small
  padding: 0.5em

.analysis-sidebar
  border-right: 1px solid #dbdbdb
  height: 80vh
  overflow: auto
  width: 15rem
  .icon
    display: block
    height: 1.2rem
    width: 1.2rem
  li
    display: flex
    button
      background-color: transparent
      border: none
      color: currentColor
      cursor: pointer
      display: flex
      margin: auto
      padding: 0
    button:hover
      color: $black
    button:disabled
      color: $grey
      cursor: not-allowed
  li > a
    display: block
    text-align: left
    text-decoration: none
    margin-left: 0.5em
  li > a::before
    padding-left: 20px
  li > span
    margin-bottom: auto
    margin-top: auto
    margin-left: 0.5em
    width 20px
  li > span:last-child
    padding-right: 0.5em
  .is-active
    background-color: $blue
    color: $white
    a
      color: $white

.subtitle
    margin-bottom: 0
    padding: 0.5em 0.5em 0.5em 0.5em
</style>

