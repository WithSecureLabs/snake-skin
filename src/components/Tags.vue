<template>
  <div class="tags">
    <template v-for="tag in formatted_tags">
      <span class="tag" v-bind:class="tag[0]">{{ tag[1] }}</span>
    </template>
  </div>
</template>


<script>
import { config } from '../config/tags.config.js'

export default {
  name: 'dropdown',
  props: [
    'tags'
  ],

  computed: {
    formatted_tags: function () {
      if (this.tags === undefined ||
          this.tags === '') {
        return []
      }
      // Handle lists and comma separated
      var tss = []
      if (this.tags instanceof Array) {
        tss = this.tags
      } else {
        tss = this.tags.split(',')
      }
      var ts = []
      for (var i in tss) {
        var parts = tss[i]
        for (var j in config.delimiters) {
          parts = tss[i].trimLeft().split(config.delimiters[j])
          if (parts.length === 2) {
            ts.push(this.styleTag(parts[0], parts[1]))
            break
          }
        }
        if (parts.length === 1) {
          ts.push(['is-primary', parts[0]])
        }
      }
      return ts
    }
  },

  methods: {
    styleTag: function (style, tag) {
      for (var i in config.types) {
        var type = config.types[i]
        if (type['keyword'] === style.toLowerCase()) {
          return [type['style'], tag]
        }
      }
      return ['is-primary', tag]
    }
  }
}
</script>


<style lang="sass" scoped>

</style>
