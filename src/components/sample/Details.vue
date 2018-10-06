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
                        >
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
        <div v-if="sample && 'parents' in sample && Object.keys(sample.parents).length > 0"
             class="box"
        >
          <h2 class="title">Parents</h2>
          <table class="table no-fixed-table">
            <thead>
              <tr>
                <th>Parent (SHA256 Digest)</th>
                <th>Submission Types</th>
              </tr>
            </thead>
            <tbody>
             <tr v-for="(v, k) in sample.parents" :key="k">
                <td>
                  <router-link tag='a' :to="'/sample/' + k">{{ k }}</router-link>
                </td>
                <td>
                  <tags :tags="v.join(',')"></tags>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="sample && 'children' in sample && Object.keys(sample.children).length > 0"
             class="box"
        >
          <h2 class="title">Children</h2>
          <table class="table no-fixed-table">
            <thead>
              <tr>
                <th>Child (SHA256 Digest)</th>
                <th>Submission Types</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, k) in sample.children" :key="k">
                <td>
                  <router-link tag='a' :to="'/sample/' + k">{{ k }}</router-link>
                </td>
                <td>
                  <tags :tags="v.join(',')"></tags>
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
        <template v-for="(v, k) in sorted(interface_infos)">
          <div :key="k" class="box">
            <h1 class="title">{{ toCaps(k) }}</h1>
            <div class="markdown" v-html="markdown(v)"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import highlightjs from 'highlightjs';
import { patchSample, getSampleHex } from '@/api/sample';
import { postScaleInterface } from '@/api/scale';
import Tags from '@/components/Tags.vue';
import { sorted, toCaps } from '@/utils/helpers';

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
    sorted,
    toCaps,

    markdown(body) {
      if (typeof body !== 'undefined') {
        return marked(body);
      }
      return marked('');
    },

    pullScaleInterfaceInfos() {
      if (this.interfaces && this.sample) {
        Object.entries(this.interfaces).forEach(([k, v]) => {
          const found = v.some(p => p.command === 'info' && p.type === 'pull');
          if (found) {
            postScaleInterface(k, 'pull', 'info', this.sample.sha256_digest, { format: 'markdown' }).then((resp) => {
              if (resp.status !== 'error') {
                this.$set(this.interface_infos, k, resp.data.interface.output);
              } else {
                this.$set(this.interface_infos, k, resp.message);
              }
            });
          }
        });
      }
    },

    saveDescription() {
      const data = {
        description: this.description,
      };
      patchSample(this.sample, data).then((resp) => {
        if (resp.status === 'success') {
          const fileType = this.sample.file_type;
          this.sample.description = resp.data[fileType].description;
        }
        this.editingDescription = false;
      });
    },

    saveName() {
      const data = {
        name: this.name,
      };
      patchSample(this.sample, data).then((resp) => {
        if (resp.status === 'success') {
          const fileType = this.sample.file_type;
          this.sample.name = resp.data[fileType].name;
        }
        this.editingName = false;
      });
    },

    saveTags() {
      const data = {
        tags: this.tags,
      };
      patchSample(this.sample, data).then((resp) => {
        if (resp.status === 'success') {
          const fileType = this.sample.file_type;
          this.sample.tags = resp.data[fileType].tags;
        }
        this.editingTags = false;
      });
    },
  },

  watch: {
    interfaces() {
      this.pullScaleInterfaceInfos();
    },

    sample() {
      getSampleHex(this.sample).then((resp) => {
        if (resp.status === 'success') {
          this.hex = resp.data.hex;
        }
      });
      this.pullScaleInterfaceInfos();
    },
  },
};
</script>

<style scoped lang="scss">
#details {
  height: 100%;
}

.markdown {
  width: 100%;
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
