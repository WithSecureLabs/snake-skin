<template>
  <div class="scale">

    <nav class="panel">

      <div class="panel-tabs module-tabs">
        <a v-on:click="active = 'overview'" :class="{ 'is-active': active === 'overview' }">Overview</a>
        <a v-if="commandsList.length > 0" v-on:click="active = 'commands'" :class="{ 'is-active': active === 'commands' }">Commands</a>
      </div>

      <div class="panel-block">
        <template v-if="active ==='overview'">
          <table class="table">
            <tbody>
              <tr>
                <th>Name</th>
                <td v-if='_scale'>{{ _scale.name }}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td v-if='_scale'>{{ _scale.description }}</td>
              </tr>
              <tr>
                <th>Version</th>
                <td v-if='_scale'>{{ _scale.version }}</td>
              </tr>
              <tr>
                <th>Author</th>
                <td v-if='_scale'>{{ _scale.author }}</td>
              </tr>
              <tr>
                <th>Components</th>
                <td v-if='_scale'>
                  <template v-for="comp in _scale.components">
                    <p>{{ comp }}</p>
                  </template>
                </td>
              </tr>
              <tr>
                <th>Supports</th>
                <td v-if='_scale'>
                  <template v-for="ft in _scale.supports">
                    <p>{{ ft }}</p>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </template>

        <template v-if="active ==='commands'">
          <div class="sidebar">
            <h3 class="subtitle">Command List</h3>
            <ul>
              <template v-for="cmd in commandsList(scale)">
                <li :class="{ 'is-active': command === cmd.command}">
                  <span class="icon is-small">
                    <icon v-if="isPending(cmd.command)" name="circle-o-notch" class="fa" aria-hidden="true" spin></icon>
                    <icon v-if="isSuccess(cmd.command)" name="check" class="fa" aria-hidden="true"></icon>
                    <icon v-if="isFailed(cmd.command)" name="times" class="fa" aria-hidden="true"></icon>
                  </span>
                  <a class="name" v-on:click="command = cmd.command">{{ cmd.command }}</a>
                  <popper :options="{placement: 'bottom'}">
                    <div class="popper">
                      <div class="padding-small">
                        <span>{{ cmd.info }}</span>
                      </div>
                    </div>
                    <span slot="reference" class="info icon is-small">
                      <icon name="info-circle" class="fa" aria-hidden="true"></icon>
                    </span>
                  </popper>
                </li>
              </template>
            </ul>
          </div>

          <div class="command">
            <nav class="level">
              <div class="level-left"></div>
              <div class="level-right">
                <button class="button is-info" :disabled="command === '' || isPending(command)" v-on:click="runCommand">Run</button>
              </div>
            </nav>
            <div class="output padding">
              <collapse accordion is-fullwidth>
                <template v-for="cmd in commands[command]">
                  <collapse-item :title=cmd.sha256_digest>
                    <div v-if="isMarkdown(cmd.command, cmd.sha256_digest)" v-html="compiledMarkdown(cmd.command, cmd.sha256_digest)" class="markdown"></div>
                    <pre v-else class="markdown">{{ commandOutput(cmd.command, cmd.sha256_digest) }}</pre>
                  </collapse-item>
                </template>
              </collapse>
            </div>
          </div>
        </template>
      </div>
    </nav>
  </div>
</template>


<script>
import { API } from '@/config/config'
import {Collapse, Item as CollapseItem} from 'vue-bulma-collapse'
import { mapActions, mapGetters, mapState } from 'vuex'
import 'vue-awesome/icons/check'
import 'vue-awesome/icons/circle-o-notch'
import 'vue-awesome/icons/info-circle'
import 'vue-awesome/icons/times'
import Icon from 'vue-awesome/components/Icon'
import Popper from 'vue-popperjs'
import Vue from 'vue'

var marked = require('marked-pax')

export default {
  name: 'scale',
  props: ['scale'],
  components: {
    Collapse,
    CollapseItem,
    Icon,
    'popper': Popper
  },

  data: () => ({
    active: 'overview',
    commands: {}, // Commands stored using {'cmd': {'sha256': data}}
    command: '',
    errors: []
  }),

  computed: {
    ...mapGetters({
      commandsList: 'scales/commands',
      scaleNames: 'scales/scaleNames'
    }),

    ...mapState({
      _scale: state => state.scale.scale
    })
  },

  mounted () {
    this.initScaleStore(this.scale)
    this.active = 'overview'
  },

  methods: {
    ...mapActions({
      initScaleStore: 'scale/initScaleStore'
    }),

    commandFormat (command, sha256Digest) {
      if (typeof this.commands[command] === 'undefined' ||
          typeof this.commands[command][sha256Digest] === 'undefined') {
        return ''
      }
      return this.commands[command][sha256Digest].format
    },

    commandFormats (command) {
      if (typeof this.commands[command] !== 'undefined') {
        var commands = []
        for (var key in this.commands[command]) {
          commands.push(this.commands[command][key].format)
        }
        return commands
      }
      return []
    },

    commandOutput (command, sha256Digest) {
      if (typeof this.commands[command] === 'undefined' ||
          typeof this.commands[command][sha256Digest] === 'undefined') {
        return ''
      }
      return this.commands[command][sha256Digest].output
    },

    commandOutputs (command) {
      if (typeof this.commands[command] !== 'undefined') {
        var commands = []
        for (var key in this.commands[command]) {
          commands.push(this.commands[command][key].output)
        }
        return commands
      }
      return []
    },

    commandStatuses (command) {
      if (typeof this.commands[command] !== 'undefined') {
        var commands = []
        for (var key in this.commands[command]) {
          commands.push(this.commands[command][key].status)
        }
        return commands
      }
      return []
    },

    commandTimestamps (command) {
      if (typeof this.commands[command] !== 'undefined') {
        var commands = []
        for (var key in this.commands[command]) {
          commands.push(this.commands[command][key].timestamp)
        }
        return commands
      }
      return []
    },

    commandStartTimes (command) {
      if (typeof this.commands[command] !== 'undefined') {
        var commands = []
        for (var key in this.commands[command]) {
          commands.push(this.commands[command][key].start_time)
        }
        return commands
      }
      return []
    },

    commandEndTimes (command) {
      if (typeof this.commands[command] !== 'undefined') {
        var commands = []
        for (var key in this.commands[command]) {
          commands.push(this.commands[command][key].end_time)
        }
        return commands
      }
      return []
    },

    compiledMarkdown (command, sha256Digest) {
      return marked(this.commandOutput(command, sha256Digest))
    },

    isFailed (command) {
      var statuses = []
      if (this.sha256Digest === '') {
        statuses = this.commandStatuses(command)
      } else {
      }
      for (var i in statuses) {
        if (statuses[i] === 'failed') {
          return true
        }
      }
      return false
    },

    isMarkdown (command, sha256Digest) {
      if (this.commandFormat(command, sha256Digest) === 'markdown') {
        return true
      }
      return false
    },

    isPending (command) {
      var statuses = []
      if (this.sha256Digest === '') {
        statuses = this.commandStatuses(command)
      } else {
      }
      if (statuses.length === 0) {
        return false
      }
      for (var i in statuses) {
        if (statuses[i] !== 'pending' && statuses[i] !== 'running') {
          return false
        }
      }
      return true
    },

    isSuccess (command) {
      var statuses = []
      if (this.sha256Digest === '') {
        statuses = this.commandStatuses(command)
      } else {
      }
      if (statuses.length === 0) {
        return false
      }
      for (var i in statuses) {
        if (statuses[i] !== 'success') {
          return false
        }
      }
      return true
    },

    getCommands (data) {
      var url = 'commands'
      var args = []

      if (typeof data['sha256_digest'] === 'undefined') {
        return
      }

      if (data['sha256_digest'] !== '') {
        args.push('sha256_digest=' + data['sha256_digest'])
      }
      if (typeof data['scale'] !== 'undefined' && data['scale'] !== '') {
        args.push('scale=' + data['scale'])
      }
      if (typeof data['command'] !== 'undefined' && data['command'] !== '') {
        args.push('command=' + data['command'])
      }
      if (args.length > 0) {
        url += '?' + args[0]
        for (var i = 1; i < args.length; i++) {
          url += '&' + args[i]
        }
      }
      API.get(url)
        .then(response => {
          var commands = response.data['data']['commands']
          for (var i in commands) {
            this.setCommand(commands[i])
          }

          // Poll any pending/running commands
          for (i in commands) {
            this.pollCommand(commands[i])
          }
        })
        .catch(e => {
          this.pushError(e)
        })
    },

    pollCommands (data) {
      if (data.length === 0) {
        return
      }
      // FIXME: Axios does not allow GET with json body, just get all the commands for now
      API.get('commands?scale=' + data[0]['scale'])
        .then(response => {
          var cmds = response.data['data']['commands']
          var pollCmds = []
          for (var i in cmds) {
            var c = cmds[i]
            this.setCommand(c)
            if (c['status'] === 'pending' ||
                c['status'] === 'running') {
              pollCmds.push(c)
            }
          }
          setTimeout(() => {
            this.pollCommands(pollCmds)
          }, 2000)
        })
        .catch(e => {
          this.pushError(e)
        })
    },

    runCommand (command) {
      var data = [{
        'sha256_digests': ['all:file'],
        'scale': this.scale,
        'command': this.command
      }]
      API.post('commands', data)
        .then(response => {
          var cmds = response.data['data']['commands']
          var pollCmds = []
          for (var i in cmds) {
            var c = cmds[i]
            this.setCommand(c)
            if (c['status'] === 'pending' ||
                c['status'] === 'running') {
              pollCmds.push(c)
            }
          }
          this.pollCommands(pollCmds)
        })
        .catch(e => {
          this.pushError(e)
        })
    },

    setCommand (command) {
      if (typeof this.commands[command['command']] === 'undefined') {
        Vue.set(this.commands, command['command'], {})
      }
      Vue.set(this.commands[command['command']], command['sha256_digest'], command)
    }
  },

  watch: {
    scale () {
      this.initScaleStore(this.scale)
      this.active = 'overview'
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'
@import '../styles/vue-popper.css'

table
  margin-bottom: 0px
  width: 100%
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

.panel
  display: block

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

.name
  flex: 1
  overflow: hidden
  text-overflow: ellipsis

.padding-small
  padding: 0.5em

.sidebar
  border-right: 1px solid #dbdbdb
  height: 80vh
  width: 15rem
  li
    display: flex
    span
      margin-bottom: auto
      margin-top: auto
      margin-left: 0.5em
      width 20px
    span:last-child
      padding-right: 0.5em;
    a
      display: block;
      text-align: left;
      text-decoration: none;
      margin-left: 0.5em
    a::before
      padding-left: 20px;
  .is-active
    background-color: $blue
    color: $white
    a
      color: $white

.subtitle
    margin-bottom: 0
    padding: 0.5em 0.5em 0.5em 0.5em
</style>
