<template>
  <div id="notes" class="notes">
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
    <div class="box">
      <textarea v-if="editingNote"
                class="textarea"
                v-model="noteBody"
                placeholder="Notes"
      ></textarea>
      <pre v-else-if="note && note.body">{{ note.body }}</pre>
      <pre v-else>No Notes</pre>
    </div>
  </div>
</template>

<script>
import { getNote, patchNote, postNote } from '@/api/note';

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
