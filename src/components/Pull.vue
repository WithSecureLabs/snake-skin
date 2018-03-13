<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        {{ toCap(pull) }}
      </p>
      <div class="card-header-icon" v-if="_args.length > 0" @click="showArgs = !showArgs">
        <a>Toggle Arguments</a>
      </div>
      <div class="card-header-icon" @click="runPull">
        <icon v-if="pulling" name="refresh" class="fa" aria-hidden="true" spin></icon>
        <icon v-else name="refresh" class="fa" aria-hidden="true"></icon>
      </div>
    </header>
    <div v-if="_args.length > 0 && showArgs" class="card-content">
      <div class="content">
        <div v-for="arg in _args" class="field">
          <label class="label">{{ toCap(arg) }}</label>
          <div class="control">
            <input class="input" type="text" v-model="$data.args[arg]" :placeholder="'Enter ' + arg">
          </div>
        </div>
      </div>
    </div>
    <div class="card-content">
      <div class="content">
        <div v-html="renderMarkdown(data)" class="markdown"></div>
      </div>
    </div>
  </div>
</template>


<script>
import { API } from '@/config/config'
import { mapActions, mapMutations, mapState } from 'vuex'
import highlightjs from 'highlight.js'
import 'vue-awesome/icons/refresh'
import Icon from 'vue-awesome/components/Icon'

var marked = require('marked-pax')
var renderer = new marked.Renderer()
renderer.code = (code, language) => {
  const validLang = !!(language && highlightjs.getLanguage(language))
  const highlighted = validLang ? highlightjs.highlight(language, code).value : code
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`
}

renderer.color = function (color, text) {
  if (color === 'blue') {
    // SASS: cc-azure
    color = 'rgb(0, 159, 227)'
  }
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
  name: 'pull',
  props: [
    'scale',
    'pull',
    'refresh'
  ],
  components: {
    Icon
  },

  data: () => ({
    args: {},
    data: 'Loading...',
    errors: [],
    puller: {},
    pulling: false,
    showArgs: false
  }),

  created () {
    var data = {
      'scale': this.scale,
      'pull': this.pull
    }
    this.getPull(data)
  },

  computed: {
    ...mapState({
      sha256Digest: state => state.file.sha256Digest // Get hash for file
    }),

    _args () {
      var p = this.puller['args']
      if (typeof p !== 'undefined') {
        if (p !== null) {
          return Object.keys(this.puller['args']).sort()
        }
      }
      return []
    }
  },

  methods: {
    ...mapActions({
      initScalesStore: 'scales/initScalesStore'
    }),

    ...mapMutations({
      activateScale: 'file/setActiveScale'
    }),

    getPull (data) {
      API.get('scale/' + data['scale'] + '/interface')
        .then(response => {
          var pullers = response.data['data']['interface']['pullers']
          for (var i in pullers) {
            var p = pullers[i]
            if (p['command'] === data['pull']) {
              this.puller = p
              this.runPull()
              return
            }
          }
        })
        .catch(e => {
          console.log(e)
          // this.errors.push(e)
        })
    },

    renderMarkdown (md) {
      return marked(md, { renderer: renderer })
    },

    runPull () {
      this.pulling = true
      this.data = 'Running...'
      var url = 'scale/' + this.scale + '/interface'
      var d = {
        'sha256_digest': this.sha256Digest,
        'type': 'pull',
        'format': 'markdown',
        'command': this.pull,
        'args': this.args
      }
      API.post(url, d)
        .then(response => {
          this.data = response.data['data']['interface']
          this.pulling = false
        })
        .catch(e => {
          if ('message' in e.response.data && typeof e.response.data.message === 'string') {
            this.data = e.response.data.message
          } else {
            this.data = 'Not run!'
          }
          this.pulling = false
          this.errors.push(e)
        })
    },

    toCap (name) {
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  },

  watch: {
    scale () {
      this.args = {}
      this.data = 'Loading...'
      this.errors = []
      this.puller = {}
      this.pulling = false
      this.showArgs = false
      var data = {
        'scale': this.scale,
        'pull': this.pull
      }
      this.getPull(data)
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

.card
  margin-bottom: 1em

.content
  overflow: auto
</style>
