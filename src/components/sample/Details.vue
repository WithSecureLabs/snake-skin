<template>
  <div id="details" class="details">
    <div class="columns">
      <div class="column">

        <div class="box">
          <h1 class="title">Summary</h1>
          <table class="table">
            <tbody>
              <tr>
                <th>Name</th>
                <td v-if="sample" style="padding-right:0">
                  <div class="level">
                    <div class="level-left" style="width: 75%">
                      <div class="level-item" style="width: 100%">
                        <input v-if="editingName"
                                  class="textarea"
                                  v-model="name"
                                  placeholder="Name"
                                  style="min-height: 30px"
                        ></input>
                        <template v-else>{{ sample.name }}</template>
                      </div>
                    </div>
                    <div class="level-right">
                      <template v-if="editingName">
                        <div class="level-item">
                          <a class="button is-danger is-small"
                             v-on:click="editingName = false">Cancel</a>
                        </div>
                        <div class="level-item">
                          <a class="button is-primary is-small"
                             v-on:click="saveName()">Save</a>
                        </div>
                      </template>
                      <a v-else
                         class="button is-primary is-outlined is-small"
                         v-on:click="name = sample.name; editingName = true"
                      >Edit</a>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Size</th>
                <td v-if="sample">{{ Math.ceil(sample.size / 100) / 10 }} KB</td>
              </tr>
              <tr>
                <th>MIME</th>
                <td v-if="sample">{{ sample.mime }}</td>
              </tr>
              <tr>
                <th>Submission Type</th>
                <td v-if="sample"><tags :tags="sample.submission_type"></tags></td>
              </tr>
              <tr>
                <th>Submission Time</th>
                <td v-if="sample">{{ sample.timestamp }}</td>
              </tr>
              <tr>
                <th>Magic</th>
                <td v-if="sample">{{ sample.magic }}</td>
              </tr>
              <tr>
                <th>SHA256 Digest</th>
                <td v-if="sample">{{ sample.sha256_digest }}</td>
              </tr>
              <tr>
                <th>Tags</th>
                <td v-if="sample" style="padding-right:0">
                  <div class="level">
                    <div class="level-left" style="width: 75%">
                      <div class="level-item" style="width: 100%">
                        <textarea v-if="editingTags"
                                  class="textarea"
                                  v-model="tags"
                                  placeholder="Tags"
                        ></textarea>
                        <tags v-else :tags="sample.tags"></tags>
                      </div>
                    </div>
                    <div class="level-right">
                      <template v-if="editingTags">
                        <div class="level-item">
                          <a class="button is-danger is-small"
                             v-on:click="editingTags = false">Cancel</a>
                        </div>
                        <div class="level-item">
                          <a class="button is-primary is-small"
                             v-on:click="saveTags()">Save</a>
                        </div>
                      </template>
                      <a v-else
                         class="button is-primary is-outlined is-small"
                         v-on:click="tags = sample.tags; editingTags = true"
                      >Edit</a>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <template v-if="hex">
          <div class="box">
            <h1 class="title">Hexdump</h1>
            <pre>{{ hex }}</pre>
          </div>
        </template>
      </div>
      <div class="column">
        <div class="box">
          <div class="level">
            <div class="level-left">
              <h1 class="title">Description</h1>
            </div>
            <div class="level-right">
              <template v-if="editingDescription">
                <div class="level-item">
                <a class="button is-danger" v-on:click="editingDescription = false">Cancel</a>
                </div>
                <div class="level-item">
                <a class="button is-primary" v-on:click="saveDescription()">Save</a>
                </div>
              </template>
              <a v-else
                 class="button is-primary is-outlined"
                 v-on:click="description = sample.description; editingDescription = true"
              >Edit</a>
            </div>
          </div>
          <textarea v-if="editingDescription"
                    class="textarea"
                    v-model="description"
                    placeholder="Description"
          ></textarea>
          <pre v-else-if="sample && sample.description">{{ sample.description }}</pre>
          <pre v-else>No Description</pre>
        </div>
        <template v-for="(v, k) in interface_infos">
          <div :key="k" class="box">
            <h1 class="title">{{ k }}</h1>
            <div v-html="markdown(v)"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import highlightjs from 'highlightjs';
import { patchSample, getSampleHex } from '@/api/sample';
import { pullScaleInterface } from '@/api/scale';
import Tags from '@/components/Tags.vue';

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
  name: 'Details',
  components: {
    tags: Tags,
  },
  props: {
    sample: {
      default: () => null,
      type: Object,
    },
    interfaces: {
      default: () => {},
      type: Object,
    },
  },
  data: () => ({
    name: '',
    editingName: false,
    tags: '',
    editingTags: false,
    description: '',
    editingDescription: false,
    hex: null,
    interface_infos: {},
  }),

  methods: {
    markdown(body) {
      if (typeof body !== 'undefined') {
        return marked(body);
      }
      return marked('');
    },

    pullScaleInterfaceInfos() {
      if (this.interfaces && this.sample) {
        Object.entries(this.interfaces).forEach(([k, v]) => {
          if (typeof v.pullers !== 'undefined') {
            const found = v.pullers.some(p => p.command === 'info');
            if (found) {
              pullScaleInterface(k, 'info', this.sample.sha256_digest, { format: 'markdown' }).then((result) => {
                if (result !== null) {
                  if (result.status !== 'error') {
                    this.$set(this.interface_infos, k, result.data.interface);
                  } else {
                    this.$set(this.interface_infos, k, result.message);
                  }
                }
              });
            }
          }
        });
      }
    },

    saveDescription() {
      const data = {
        description: this.description,
      };
      patchSample(this.sample, data).then((result) => {
        this.sample.description = result.description;
        this.editingDescription = false;
      });
    },

    saveName() {
      const data = {
        name: this.name,
      };
      patchSample(this.sample, data).then((result) => {
        this.sample.name = result.name;
        this.editingName = false;
      });
    },

    saveTags() {
      const data = {
        tags: this.tags,
      };
      patchSample(this.sample, data).then((result) => {
        this.sample.tags = result.tags;
        this.editingTags = false;
      });
    },
  },

  watch: {
    interfaces() {
      this.pullScaleInterfaceInfos();
    },

    sample() {
      getSampleHex(this.sample).then((result) => {
        this.hex = result;
      });
      this.pullScaleInterfaceInfos();
    },
  },
};
</script>

<style lang="scss">
#details {
  height: 100%;
}

pre {
  background-color: white;
}

table {
  tbody {
    tr {
      th {
        width: 10rem;
      }
    }
    tr:not(:last-child) {
      padding-bottom: 2em;
    }
  }
}
</style>
