<template>
  <div id="output" class="output">
    <div>
      <div v-if="format === 'markdown'"
           v-html="markdown"
           class="markdown"
      ></div>
      <pre v-else>{{ output }}</pre>
    </div>
    <b-loading :is-full-page="false"
               :active="loading"
               :can-cancel="false"
               style="z-index:0"
    ></b-loading>
  </div>
</template>

<script>
import highlightjs from 'highlightjs';

const marked = require('marked-pax');

const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const validLang = !!(language && highlightjs.getLanguage(language));
  const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
};

renderer.color = function func(color, text) {
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
  name: 'Output',
  props: {
    format: {
      default: () => null,
      type: String,
    },
    loading: {
      default: () => false,
      type: Boolean,
    },
    output: {
      default: () => null,
    },
  },

  computed: {
    markdown() {
      if (this.output === null) {
        return marked('');
      }
      return marked(this.output);
    },
  },
};
</script>

<style lang="scss" scoped>
.output {
  height: 100%;
  overflow: auto;
  position: relative;
}
</style>
