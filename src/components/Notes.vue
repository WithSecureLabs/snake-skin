<template>
  <div class="notes column">
    <div class="box">
      <template v-if="isNotePending">
        <textarea class="textarea" :value="pendingNote['body']" @input="updatePendingNote" placeholder="No notes available!"></textarea>
      </template>
      <template v-else>
        <div v-html="compiledMarkdown" class="markdown"></div>
      </template>
    </div>
    <div class="level">
      <div class="level-left"></div>
      <div class="level-right">
        <template v-if="isNotePending">
          <div class="control">
            <a class="button is-red" v-on:click="setPendingNote({})">Cancel</a>
            <a class="button is-primary" v-on:click="storeNote()">Save</a>
          </div>
        </template>
        <template v-else>
          <a class="button is-primary is-outlined" v-on:click="editNote()">Edit</a>
        </template>
      </div>
    </div>
  </div>
</template>


<script>
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import marked, { Renderer } from 'marked'
import highlightjs from 'highlight.js'

const renderer = new Renderer()
renderer.code = (code, language) => {
  const validLang = !!(language && highlightjs.getLanguage(language))
  const highlighted = validLang ? highlightjs.highlight(language, code).value : code
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`
}
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

marked.setOptions({
  breaks: true,
  renderer: renderer
})

export default {
  name: 'notes',

  computed: {
    ...mapGetters({
      isNotePending: 'file/isNotePending'
    }),

    ...mapState({
      note: state => state.file.note,
      pendingNote: state => state.file.pendingNote
    }),

    compiledMarkdown: function () {
      if (typeof this.note['body'] === 'undefined' || this.note['body'] === '') {
        return marked('No notes available!')
      }
      return marked(this.note['body'])
    }
  },

  methods: {
    ...mapActions({
      saveNote: 'file/saveNote'
    }),

    ...mapMutations({
      setNote: 'file/setNote',
      setPendingNote: 'file/setPendingNote',
      setPendingNoteBody: 'file/setPendingNoteBody'
    }),

    editNote: function () {
      var n = this.note
      if (Object.keys(n).length === 0) {
        n = {'body': ''}
      }
      this.setPendingNote(n)
    },

    storeNote: function () {
      this.saveNote()
    },

    updatePendingNote (e) {
      this.setPendingNoteBody(e.target.value)
    }
  }
}
</script>


<style lang="sass" scoped>
.textarea
  height: 90vh
</style>
