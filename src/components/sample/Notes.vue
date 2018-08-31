<template>
  <div id="notes" class="notes">
    <div class="box">
      <div class="level">
        <div class="level-left">
          <h1 class="title">Notes</h1>
        </div>
        <div class="level-right">
          <template v-if="editingNote">
            <div class="level-item">
            <a class="button is-danger" v-on:click="editingNote = false">Cancel</a>
            </div>
            <div class="level-item">
            <a class="button is-primary" v-on:click="saveNote()">Save</a>
            </div>
          </template>
          <a v-else
             class="button is-primary is-outlined"
             v-on:click="if (note) {noteBody = note.body}; editingNote = true"
          >Edit</a>
        </div>
      </div>
      <textarea v-if="editingNote"
                class="textarea"
                v-model="noteBody"
                placeholder="Notes"
      ></textarea>
      <pre v-else-if="note && note.body" v-html="markdown"></pre>
      <pre v-else>No Notes</pre>
    </div>
  </div>
</template>

<script>
import highlightjs from 'highlightjs';
import { getNote, patchNote, postNote } from '@/api/note';

const marked = require('marked-pax');

const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const validLang = !!(language && highlightjs.getLanguage(language));
  const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
};

renderer.color = function (color, text) {
  if (color === 'green') {
    // SASS: cc-greenblue
    // eslint-disable-next-line no-param-reassign
    color = 'rgb(36, 200, 148)';
  }
  if (color === 'yellow') {
    // SASS: cc-pumpkin
    // eslint-disable-next-line no-param-reassign
    color = 'rgb(237, 137, 0)';
  }
  if (color === 'red') {
    // SASS: cc-faded-red
    // eslint-disable-next-line no-param-reassign
    color = 'rgb(218, 68, 83)';
  }
  return `<span style="color:${color}">${text}</span>`;
};

marked.setOptions({
  breaks: true,
  renderer,
  sanitize: true,
  xhtml: true,
});

export default {
  name: 'Notes',
  props: {
    sha256_digest: {
      default: () => null,
      type: String,
    },
  },

  data: () => ({
    note: null,
    noteBody: '',
    editingNote: false,
  }),

  mounted() {
    getNote(this.sha256_digest).then((result) => {
      this.note = result;
    });
  },

  computed: {
    markdown() {
      const { body } = this.note;
      if (typeof body !== 'undefined') {
        return marked(body);
      }
      return marked('');
    },
  },

  methods: {
    saveNote() {
      const data = {
        body: this.noteBody,
      };
      if (this.note) {
        patchNote(this.sha256_digest, data).then((result) => {
          this.note = result;
          this.editingNote = false;
        });
      } else {
        postNote(this.sha256_digest, data).then((result) => {
          this.note = result;
          this.editingNote = false;
        });
      }
    },
  },

  watch: {
    sha256_digest() {
      getNote(this.sha256_digest).then((result) => {
        this.note = result;
      });
    },
  },
};
</script>

<style lang="scss">
</style>
