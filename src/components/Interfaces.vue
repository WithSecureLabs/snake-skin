<template>
  <div class="interface">
    <nav class="panel">
      <div class="panel-tabs module-tabs">
        <a v-for="name in scaleNames('interface')" :class="{ 'is-active': scale === name }" v-on:click="selectScale(name)">{{ name }}</a>
      </div>
      <div class="panel-block">
        <template v-if="scale === ''">
          <h2 class="no-select">No Interface Selected!</h2>
        </template>
        <template v-else>
          <div v-if="pushs.length > 0" class="push">
            <h2>Pushers</h2>
            <dropdown name="Commands" :items="pushs" :onclick=selectPusher></dropdown>
            <div class="pusher" v-if="activePush !== null">
              <label class="label">Info</label>
              <p class="subtitle">
                {{ pushers[activePush]['info'] }}
              </p>
              <div class="content">
                <div v-for="arg in _pushArgs" class="field">
                  <label class="label">{{ toCap(arg) }}</label>
                  <div class="control">
                    <input class="input" type="text" v-model="$data.pushArgs[arg]" :placeholder="'Enter ' + arg">
                  </div>
                </div>
                <div class="field is-grouped">
                  <div class="control">
                    <button class="button is-primary" :disabled="pushing" v-on:click="runPush">Push</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <pre>No pusher selected!</pre>
            </div>
          </div>
          <div class="pull">
            <h2>Pullers</h2>
            <template v-for="p in pulls">
              <pull :scale="scale" :pull="p" :refresh="timestamp"></pull>
            </template>
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
import 'vue-awesome/icons/refresh'
import Icon from 'vue-awesome/components/Icon'
import Pull from '@/components/Pull'
import Vue from 'vue'

export default {
  name: 'interfaces',
  components: {
    'dropdown': Dropdown,
    'pull': Pull,
    Icon
  },

  data: () => ({
    activePush: null,
    pushArgs: {},
    pushers: {},
    pushing: false,
    pulls: [],
    pushs: [],
    timestamp: Date.now()
  }),

  mounted () {
    if (this.scale !== '') {
      this.selectScale(this.scale)
    }
  },

  computed: {
    ...mapGetters({
      scaleNames: 'scales/scaleNames'
    }),

    ...mapState({
      scale: state => state.file.activeInterfaceScale, // Persist currently selected scale
      file: state => state.file.file, // Access the selected file
      interfaces: state => state.scales.interfaces,
      sha256Digest: state => state.file.sha256Digest // Get hash for file
    }),

    _pushArgs () {
      if (this.activePush === null) {
        return []
      }
      var p = this.pushers[this.activePush]
      if (typeof p === 'undefined') {
        return []
      }
      var a = p['args']
      if (typeof a !== 'undefined') {
        if (a !== null) {
          return Object.keys(a).sort()
        }
      }
      return []
    }
  },

  methods: {
    ...mapMutations({
      activateScale: 'file/setActiveInterfaceScale'
    }),

    getPullers () {
      var pullers = this.interfaces[this.scale]['pullers']
      var ps = []
      for (var i in pullers) {
        var p = pullers[i]
        ps.push(p['command'])
      }
      this.pulls = ps.sort()
    },

    getPushers () {
      var pushers = this.interfaces[this.scale]['pushers']
      var ps = []
      for (var i in pushers) {
        var p = pushers[i]
        ps.push(p['command'])
        Vue.set(this.pushers, p['command'], p)
      }
      this.pushs = ps.sort()
    },

    runPush () {
      var url = 'scale/' + this.scale + '/interface'
      var d = {
        'sha256_digest': this.sha256Digest,
        'type': 'push',
        'format': 'markdown',
        'command': this.activePush,
        'args': this.pushArgs
      }
      this.pushing = true
      API.post(url, d)
        .then(response => {
          console.log(response.data['data']['interface'])
          this.pushing = false
        })
        .catch(e => {
          console.log(e)
          this.pushing = false
          // this.errors.push(e)
        })
    },

    selectPusher (name) {
      this.activePush = name
    },

    selectScale (scaleName) {
      this.activateScale(scaleName)
      this.getPullers()
      this.getPushers()
    },

    toCap (name) {
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  },

  watch: {
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

.card
  margin-bottom: 1em

.no-select
  padding: 1em
  text-align: center
  width: 100%

.panel-block
  padding: 0

.panel-tabs
  justify-content: left

.pull
  height: 80vh
  overflow: auto
  padding: 0.75em
  width: 100%

.push
  border-right: 1px solid #dbdbdb
  height: 80vh
  overflow: auto
  padding: .75em
  width: 20rem

.pusher
  padding-top: .75em

.subtitle
  font-size: 1em

</style>
