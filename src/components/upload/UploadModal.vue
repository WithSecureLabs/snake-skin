<template>
  <div id="upload-modal" class="upload-modal">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Upload</p>
      </header>
      <section class="modal-card-body">
        <b-tabs v-model="page">
          <b-tab-item label="Upload Type">
            <b-field label="Sample Type:">
              <section>
              <div class="field">
                <b-radio v-model="sample_type" native-value="file">
                  File (doc, exe, txt, etc...)
                </b-radio>
              </div>
              <div class="field">
                <b-radio v-model="sample_type" native-value="memory">
                  Memory (aff4, dmp, mdmp, raw, etc...)
                </b-radio>
              </div>
              </section>
            </b-field>
            <b-field label="Submission Type:">
              <section>
                <div class="field">
                  <b-radio v-model="submission_type" native-value="disk">
                    Sample
                  </b-radio>
                </div>
                <div v-for="(v, k) in sorted(uploads)" class="field" :key="k">
                  <b-radio v-model="submission_type" :native-value="k">
                    {{ toCaps(k) }}
                  </b-radio>
                </div>
              </section>
            </b-field>
          </b-tab-item>

          <b-tab-item label="Sample Details">
            <template v-if="submission_type === 'disk'">
              <b-field label="Sample">
                <div class="level">
                  <div class="level-left">
                    <b-field class="file">
                      <b-upload v-model="files">
                        <a class="button is-primary">
                          <b-icon icon="upload"></b-icon>
                          <span>Click to upload</span>
                        </a>
                      </b-upload>
                      <span class="file-name"
                        v-if="files && files.length">
                        {{ files[0].name }}
                      </span>
                    </b-field>
                  </div>
                  <div class="level-right">
                    <span v-if="typeof this.errors['disk'] !== 'undefined'"
                          class="icon is-right has-text-danger">
                      <i class="mdi mdi-alert-circle mdi-24px"></i>
                    </span>
                  </div>
                </div>
              </b-field>
            </template>
            <template v-else>
              <b-field v-for="(v, k) in uploads[submission_type].args"
                       :label="toCaps(k)"
                       :key="k"
                       :type="isDanger(k)">
                <b-input v-model="$data.args[k]" :placeholder="k"></b-input>
              </b-field>
              <b-field label="Autoname">
                <div class="field">
                  <b-checkbox v-model="autoname">
                    Allow Snake to autoname the file
                  </b-checkbox>
                </div>
              </b-field>

              <transition name="slide-fade">
                <template v-if="!autoname">
                  <div class="field">
                    <label class="label">Name</label>
                    <div class="control">
                      <input class="input"
                             type="text"
                             v-model="name"
                             placeholder="Sample Name">
                    </div>
                  </div>
                </template>
              </transition>
            </template>

            <b-field label="Archive">
              <div class="field">
                <b-checkbox v-model="extract">
                  Extract sample on upload
                </b-checkbox>
              </div>
            </b-field>

            <transition name="slide-fade">
              <template v-if="extract">
                <div class="field">
                  <label class="label">Archive Password</label>
                  <div class="control">
                    <input class="input"
                           type="text"
                           v-model="password"
                           placeholder="Archive Password">
                  </div>
                </div>
              </template>
            </transition>

            <b-field label="Tags">
              <b-taginput
                  v-model="tags"
                  ellipsis
                  icon="label"
                  placeholder="Add a tag">
              </b-taginput>
            </b-field>

            <b-field label="Description">
              <b-input type="textarea" v-model="description"></b-input>
            </b-field>
          </b-tab-item>

          <b-tab-item label="Additional">
            <b-field label="Analysis">
              <div class="level">
                <div class="level-left">
                  <b-select placeholder="Select a scale" v-model="commandScale">
                    <option v-for="(v, k) in sorted(commands)"
                            :value="k"
                            :key="k">
                            {{ k }}
                    </option>
                  </b-select>
                  <b-select placeholder="Select a command"
                            v-model="commandName"
                            :disabled="!commandScale">
                    <template v-if="typeof commands[commandScale] !== 'undefined'">
                      <option v-for="command in commands[commandScale]"
                              :value="command.command"
                              :key="command.command">
                              {{ command.command }}
                      </option>
                    </template>
                  </b-select>
                </div>
                <div class="level-right">
                  <button class="button is-primary"
                          @click="addCommand()"
                          :disabled="!commandScale || !commandName"
                  >Add</button>
                </div>
              </div>
            </b-field>
            <div class="field">
              <b-tag v-for="cmd in cmds"
                  :key="cmd"
                  type="is-primary"
                  closable
                  @close="cmds.splice(cmds.indexOf(cmd), 1)"
              >{{ cmd }}</b-tag>
            </div>
            <b-field label="Interfaces">
              <div class="level">
                <div class="level-left">
                  <b-select placeholder="Select a scale" v-model="pusherScale">
                    <option v-for="(v, k) in sorted(interfaces)"
                            :value="k"
                            :key="k">
                            {{ k }}
                    </option>
                  </b-select>
                  <b-select placeholder="Select a pusher"
                            v-model="pusherName"
                            :disabled="!pusherScale">
                    <template v-if="typeof interfaces[pusherScale] !== 'undefined'">
                      <option v-for="pusher in interfaces[pusherScale].pushers"
                              :value="pusher.command"
                              :key="pusher.command">
                              {{ pusher.command }}
                      </option>
                    </template>
                  </b-select>
                </div>
                <div class="level-right">
                  <button class="button is-primary"
                          @click="addPusher()"
                          :disabled="!pusherScale || !pusherName"
                  >Add</button>
                </div>
              </div>
            </b-field>
            <div class="field">
              <b-tag v-for="psh in pshs"
                  :key="psh"
                  type="is-primary"
                  closable
                  @close="pshs.splice(pshs.indexOf(psh), 1)"
              >{{ psh }}</b-tag>
            </div>
          </b-tab-item>

          <b-tab-item label="Progress">
            <progress class="progress" value="15" max="100">15%</progress>
          </b-tab-item>

          <b-tab-item label="Summary">
            <h1 v-if="alreadyUploaded" class="title">Already Uploaded</h1>
            <h1 v-else-if="failed" class="title">Uploaded Failed</h1>
            <h1 v-else class="title">Successfully Uploaded</h1>
            <div v-if="failed" class="box">
              <pre>{{ uploaded.error }}</pre>
            </div>
            <template v-else>
              <div class="box">
                <h1 class="title">Details</h1>
                <table class="table">
                  <tbody>
                    <tr>
                      <th>Name</th>
                      <td v-if="uploaded.sample">
                        {{ uploaded.sample.name }}
                      </td>
                    </tr>
                    <tr>
                      <th>Size</th>
                      <td v-if="uploaded.sample">
                        {{ Math.ceil(uploaded.sample.size / 100) / 10 }} KB
                      </td>
                    </tr>
                    <tr>
                      <th>MIME</th>
                      <td v-if="uploaded.sample">
                        {{ uploaded.sample.mime }}
                      </td>
                    </tr>
                    <tr>
                      <th>Submission Type</th>
                      <td v-if="uploaded.sample">
                        <tags :tags="uploaded.sample.submission_type"></tags>
                      </td>
                    </tr>
                    <tr>
                      <th>Submission Time</th>
                      <td v-if="uploaded.sample">
                        {{ uploaded.sample.timestamp }}
                      </td>
                    </tr>
                    <tr>
                      <th>Magic</th>
                      <td v-if="uploaded.sample">
                        {{ uploaded.sample.magic }}
                      </td>
                    </tr>
                    <tr>
                      <th>SHA256 Digest</th>
                      <td v-if="uploaded.sample">
                        {{ uploaded.sample.sha256_digest }}
                      </td>
                    </tr>
                    <tr>
                      <th>Tags</th>
                      <td v-if="uploaded.sample">
                        <tags :tags="uploaded.sample.tags"></tags>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="typeof uploaded.commands !== 'undefined'" class="box">
                <h1 class="title">Queued Commands</h1>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Scale</th>
                      <th>Command</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="command in uploaded.commands" :key="command.scale + command.command">
                      <td>{{ command.scale }}</td>
                      <td>{{ command.command }}</td>
                      <td>{{ command.status }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="typeof uploaded.pushers !== 'undefined'" class="box">
                <h1 class="title">Queued Pushers</h1>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Scale</th>
                      <th>Pusher</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="pusher in uploaded.pushers" :key="pusher.scale + pusher.command">
                      <td>{{ pusher.scale }}</td>
                      <td>{{ pusher.command }}</td>
                      <td>{{ pusher.status }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </b-tab-item>
        </b-tabs>
      </section>
      <footer class="modal-card-foot">
        <div v-if="page == 4" class="level">
          <div class="level-left">
            <button class="button is-danger" @click="close()">Close</button>
          </div>
          <div class="level-right">
            <button v-if="!failed"
                    class="button is-primary"
                    @click="proceed()"
            >Proceed</button>
          </div>
        </div>
        <div v-else-if="page < 3" class="level">
          <div class="level-left">
            <button class="button is-danger" @click="close()">Cancel</button>
          </div>
          <div class="level-right">
            <button v-if="page !== 0" class="button" @click="previous()">Previous</button>
            <button v-if="page === 2" class="button is-success" @click="submit()">Submit</button>
            <button v-else class="button is-primary" @click="next()">Next</button>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { postCommands } from '@/api/command';
import { getScales, getScaleCommands, getScaleInterface, getScaleUpload, postScaleInterface } from '@/api/scale';
import { sorted, toCaps } from '@/utils/helpers';
import { SNAKE_API } from '@/settings';
import Tags from '@/components/Tags.vue';

export default {
  name: 'UploadModal',
  components: {
    tags: Tags,
  },
  data: () => ({
    args: {},
    autoname: true,
    description: '',
    name: '',
    errors: {},
    extract: false,
    files: [],
    page: 0,
    password: '',
    sample_type: 'file',
    submission_type: 'disk',
    tags: [],

    commandScale: null,
    commandName: null,
    pusherScale: null,
    pusherName: null,
    cmds: [],
    pshs: [],

    commands: {},
    interfaces: {},
    uploads: {},

    alreadyUploaded: false,
    failed: false,
    uploaded: {},
  }),

  mounted() {
    // Load in the scales, need for extended capability
    this.loadScales();
  },

  methods: {
    // Re-expose
    sorted,
    toCaps,

    addCommand() {
      if (this.commandScale && this.commandName) {
        const cmd = `${this.commandScale}:${this.commandName}`;
        if (this.cmds.indexOf(cmd) === -1) {
          this.cmds.push(cmd);
        }
      }
    },

    addPusher() {
      if (this.pusherScale && this.pusherName) {
        const psh = `${this.pusherScale}:${this.pusherName}`;
        if (this.pshs.indexOf(psh) === -1) {
          this.pshs.push(psh);
        }
      }
    },

    isDanger(field) {
      let key = 'disk';
      if (this.submission_type !== 'disk') {
        key = this.submission_type + field;
      }
      if (typeof this.errors[key] !== 'undefined') {
        return 'is-danger';
      }
      return '';
    },

    async loadScales() {
      // TODO: Should only get these once then filter on the front end for sample type
      this.commands = {};
      this.interfaces = {};
      this.uploads = {};
      const resp = await getScales(this.sample_type);
      if (resp.status === 'success') {
        const { scales } = resp.data;
        scales.forEach((scale) => {
          // Loop the components and load them
          scale.components.forEach((component) => {
            if (component === 'commands') {
              getScaleCommands(scale.name).then((result) => {
                if (result.status === 'success') {
                  this.$set(this.commands, scale.name, result.data.commands);
                }
              });
            } else if (component === 'interface') {
              getScaleInterface(scale.name).then((result) => {
                if (result.status === 'success') {
                // Only if they have pushers
                  if (result.data.interface.pushers.length > 0) {
                    this.$set(this.interfaces, scale.name, result.data.interface);
                  }
                }
              });
            } else if (component === 'upload') {
              getScaleUpload(scale.name).then((result) => {
                if (result.status === 'success') {
                  this.$set(this.uploads, scale.name, result.data.upload);
                }
              });
            }
          });
        });
      }
    },

    close() {
      this.$parent.close();
    },

    next() {
      // Validate page
      if (this.page === 1) {
        this.errors = {};
        // TODO: Set is-danger and prevent progression
        if (this.submission_type === 'disk') {
          if (this.files.length === 0) {
            this.errors.disk = true;
            return;
          }
        } else {
          let failed = false;
          const { args } = this.uploads[this.submission_type];
          const argKeys = Object.keys(this.args);
          Object.entries(args).forEach(([k]) => {
            const key = this.submission_type + k;
            if (argKeys.indexOf(k) === -1 || this.args[k] === '') {
              this.errors[key] = true;
              failed = true;
            }
          });
          if (failed) {
            return;
          }
        }
      }
      if (this.page < 2) {
        this.page = this.page + 1;
      }
    },

    previous() {
      if (this.page > 0) {
        this.page = this.page - 1;
      }
    },

    proceed() {
      this.close();
      const { sample } = this.uploaded;
      this.$router.push(`/${sample.file_type}/${sample.sha256_digest}`);
    },

    submit() {
      this.page = 3;
      let body = {};
      let path = '';
      if (this.submission_type === 'disk') {
        // Sample based
        const form = new FormData();
        form.append('file', this.files[0]);
        form.append('name', this.files[0].name);
        form.append('tags', this.tags.join(','));
        form.append('description', this.description);
        form.append('file_type', this.sample_type);
        if (this.extract) {
          form.append('extract', this.extract);
          if (this.password !== '') {
            form.append('password', this.password);
          }
        }

        body = form;
        path = `upload/${this.sample_type}`;
      } else {
        // Scale upload based
        const data = {
          args: this.args,
          description: this.description,
          file_type: this.sample_type,
          tags: this.tags.join(','),
        };
        if (!this.autoname) {
          data.name = this.name;
        }
        if (this.extract) {
          data.extract = this.extract;
          if (this.password !== '') {
            data.password = this.password;
          }
        }

        body = data;
        path = `scale/${this.submission_type}/upload`;
      }
      // Don't use the API as we handle this in a special way
      fetch(`${SNAKE_API}/${path}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }).then((res) => {
        // 409 means already uploaded, progress to page 5
        if (res.status === 409) {
          this.alreadyUploaded = true;
        } else if (res.status < 200 || res.status >= 300) {
          return Promise.reject(res);
        }
        return res.json();
      }).then(async (data) => {
        const { sample } = data.data;
        this.uploaded.sample = sample;
        if (!this.alreadyUploaded) {
          // Queue the commands and interfaces
          const cmds = [];
          this.cmds.forEach((cmd) => {
            const [scale, command] = cmd.split(':');
            cmds.push({
              scale,
              command,
              sha256_digests: [sample.sha256_digest],
              asynchronous: true,
            });
          });
          if (cmds.length > 0) {
            const resp = await postCommands(cmds);
            if (resp.status === 'success') {
              this.uploaded.commands = resp.data.commands;
            }
          }
          if (this.pshs.length > 0) {
            this.uploaded.pushers = [];
          }
          this.pshs.forEach(async (psh) => {
            const [scale, command] = psh.split(':');
            const resp = await postScaleInterface(scale, 'push', command, sample.sha256_digest);
            this.uploaded.pushers.push({
              scale,
              command: resp.data.command,
              status: resp.status,
            });
          });
          this.uploaded = Object.assign({}, this.uploaded);
        }
        this.page = 4;
      }).catch((e) => {
        e.json().then((j) => {
          console.error(j);
          this.uploaded.error = j;
          this.failed = true;
          this.page = 4;
        });
      });
    },
  },

  watch: {
    sample_type() {
      this.loadScales();
    },
  },
};
</script>

<style lang="scss">
#upload-modal {
  .modal-card {
    min-width: 600px;
    width: auto;
  }
}

.modal-card {
  .modal-card-body {
    .b-tabs {
      .tabs {
        display: none;
      }
    }
  }
  .modal-card-foot {
    display: block;
  }
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all .3s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

</style>
