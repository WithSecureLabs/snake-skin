<template>
  <div id="interfaces" class="interfaces">
    <div class="sidebar">
      <input id="input"
            class="input"
            type="text"
            v-model="searchText"
            placeholder="Scale..."
            style="width:190px"
      >
      <div>
        <ul class="menu-list">
          <b-collapse :open="true" class="menu-section" v-for="(v, k) in sorted(scales)" :key=k>
          <a slot="trigger" class="menu-label" slot-scope="props">
            <div class="level">
            <div class="level-left">
            <span class="scale">{{ k }}</span>
            </div>
            <div class="level-right">
            <i class="mdi mdi-18px"
               :class="props.open ? 'mdi-menu-down' : 'mdi-menu-right'"
               aria-hidden="true"></i>
            </div>
            </div>
          </a>
          <div v-if="v.pullers.length > 0">
            <h2 class="menu-label submenu-label">Pullers</h2>
            <ul class="menu-list">
              <li>
                <a v-for="cmd in v.pullers" :key="k + cmd.command"
                   :class="{'is-active': isActive(k, 'pull', cmd.command)}"
                   @click="selectCommand(k, 'pull', cmd.command)">
                  <div class="level">
                    <div class="level-left">
                      - {{ cmd.command }}
                    </div>
                    <div class="level-right">
                      <i v-if="isPending(k, 'pull', cmd.command)"
                         class="mdi mdi-dots-horizontal mdi-18px"
                         aria-hidden="true"></i>
                      <i v-if="isRunning(k, 'pull', cmd.command)"
                         class="mdi mdi-loading mdi-18px spin"
                         aria-hidden="true"></i>
                      <i v-if="isSuccess(k, 'pull', cmd.command)"
                         class="mdi mdi-check mdi-18px"
                         aria-hidden="true"></i>
                      <i v-if="isFailed(k, 'pull', cmd.command)"
                         class="mdi mdi-close mdi-18px"
                         aria-hidden="true"></i>
                      <div>
                        <i v-tooltip="{
                            content: cmd.info,
                            placement: 'bottom',
                            classes: ['tooltip'],
                           }"
                           class="mdi mdi-information mdi-18px" aria-hidden="true"></i>
                        <button :disabled="isPending(k, 'pull', cmd.command) || isRunning(k, 'pull', cmd.command)"
                                @click="runCommand(k, 'pull',cmd.command)"
                                class="icon-button"
                        >
                          <i class="mdi mdi-play-circle mdi-18px" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          <div v-if="v.pushers.length > 0">
            <h2 class="menu-label submenu-label">Pushers</h2>
            <ul class="menu-list">
              <li>
                <a v-for="cmd in v.pushers" :key="k + cmd.command"
                   :class="{'is-active': isActive(k, 'push', cmd.command)}"
                   @click="selectCommand(k, 'push', cmd.command)">
                  <div class="level">
                    <div class="level-left">
                      - {{ cmd.command }}
                    </div>
                    <div class="level-right">
                      <i v-if="isPending(k, 'push', cmd.command)"
                         class="mdi mdi-dots-horizontal mdi-18px"
                         aria-hidden="true"></i>
                      <i v-if="isRunning(k, 'push', cmd.command)"
                         class="mdi mdi-loading mdi-18px spin"
                         aria-hidden="true"></i>
                      <i v-if="isSuccess(k, 'push', cmd.command)"
                         class="mdi mdi-check mdi-18px"
                         aria-hidden="true"></i>
                      <i v-if="isFailed(k, 'push', cmd.command)"
                         class="mdi mdi-close mdi-18px"
                         aria-hidden="true"></i>
                      <div>
                        <i v-tooltip="{
                            content: cmd.info,
                            placement: 'bottom',
                            classes: ['tooltip'],
                           }"
                           class="mdi mdi-information mdi-18px" aria-hidden="true"></i>
                        <button :disabled="isPending(k, 'push', cmd.command) || isRunning(k, 'push', cmd.command)"
                                @click="runCommand(k, 'push', cmd.command)"
                                class="icon-button"
                        >
                          <i class="mdi mdi-play-circle mdi-18px" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
          </b-collapse>
        </ul>
        <ul v-if="Object.keys(scales).length === 0">
          No Interfaces...
        </ul>
      </div>
    </div>
    <div v-if="selectedScale && selectedType && selectedCommand" class="content">
      <div class="content-header">
        <div class="level">
          <div class="level-left">
            <b-collapse class="level-item" :open.sync="showDetails">
              <div slot="trigger" slot-scope="props">
                <i class="mdi mdi-18px"
                   :class="props.open ? 'mdi-menu-down' : 'mdi-menu-right'"
                   aria-hidden="true"></i>
                <span>Toggle Arguments</span>
              </div>
            </b-collapse>
            <div class="level-item">
              <span>Format: </span>
              <b-dropdown>
                <button class="button is-outlined" slot="trigger">
                  <span>{{ format }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>
                <b-dropdown-item v-for="format in formats"
                                 :key=format
                                 @click="changeFormat(format)"
                >{{ format }}</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
          <div class="level-right">
          </div>
        </div>
        <div v-if="showDetails">
          <b-field label="Timeout">
            <b-input type="number" 
                     v-model="timeout" 
                     placeholder="Enter Timeout... (default: 600)"
            ></b-input>
          </b-field>
          <template v-for="(v, k) in commandArguments(selectedScale, selectedType, selectedCommand)">
            <b-field :label="toCaps(k, {'delimiter': '_'})" :key="k">
              <b-select v-if="v.values.length > 0"
                        v-model="$data.arguments[k]"
                        :placeholder="getDefaultArgument(v)"
              >
                <option v-if="v.default === null" value="null">None</option>
                <option v-for="value in v.values" :key="value" :value="value">{{ value }}</option>
              </b-select>
              <b-checkbox v-else-if="(v.type === 'boolean') && ($data.arguments[k] = v.default)"
                          v-model="$data.arguments[k]"
              >
                {{ toCaps(k) }}
              </b-checkbox>
              <b-input v-else-if="v.type === 'integer'"
                       type="number"
                       v-model="$data.arguments[k]"
                       :placeholder="'Enter ' + toCaps(k, {'delimiter': '_'}) + '... (default: ' + getDefaultArgument(v) + ')'"
              ></b-input>
              <b-input v-else
                       v-model="$data.arguments[k]"
                       :placeholder="'Enter ' + toCaps(k, {'delimiter': '_'}) + '... (default: ' + getDefaultArgument(v) + ')'"
              ></b-input>
            </b-field>
          </template>
        </div>
      </div>
      <div class="content-body">
        <div style="height:100%">
          <div v-if="format === 'markdown'"
               v-html="renderMarkdown(selectedScale, selectedType, selectedCommand)"
               class="markdown"
               style="height:100%"
          ></div>
          <pre v-else style="height:100%">{{ getExecuted.output }}</pre>
        </div>
        <b-loading :is-full-page="false"
                   :active="isLoading(selectedScale, selectedType, selectedCommand)"
                   :can-cancel="false"
        ></b-loading>
      </div>
    </div>
  </div>
</template>

<script>
import highlightjs from 'highlightjs';
import { postScaleInterface } from '@/api/scale';
import { FORMATS } from '@/settings';
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
  name: 'Interfaces',
  props: {
    interfaces: {
      default: () => {},
      type: Object,
    },
    sha256_digest: {
      default: () => null,
      type: String,
    },
  },
  data: () => ({
    arguments: {},
    executed: {},
    format: 'json',
    formats: [],
    polling: false,
    showDetails: false,
    scales: {},
    searchText: '',
    selectedScale: null,
    selectedType: null,
    selectedCommand: null,
    timeout: '',
  }),

  computed: {
    getExecuted() {
      const scale = this.selectedScale;
      const command = this.selectedCommand;
      if (scale && command) {
        if (typeof this.executed[scale] !== 'undefined' && typeof this.executed[scale][command] !== 'undefined') {
          return this.executed[scale][command];
        }
      }
      return '';
    },
  },

  mounted() {
  },

  methods: {
    toCaps,

    sorted(dict) {
      let d = sorted(dict);
      if (this.searchText !== '') {
        const temp = {};
        Object.entries(d).forEach(([k, v]) => {
          if (k.includes(this.searchText)) {
            temp[k] = v;
          }
        });
        d = temp;
      }
      return d;
    },

    getDefaultArgument(argument) {
      if (argument.default == null) {
        return 'None';
      }
      return argument.default;
    },

    changeFormat(format) {
      this.format = format;
      this.runCommand(this.selectedScale, this.selectedType, this.selectedCommand);
    },

    isActive(scale, type, command) {
      return this.selectedScale === scale &&
              this.selectedType === type &&
              this.selectedCommand === command;
    },

    isLoading(scale, type, command) {
      return this.isPending(scale, type, command) || this.isRunning(scale, type, command);
    },

    runCommand(scale, type, command) {
      if (typeof this.executed[scale] === 'undefined') {
        this.executed[scale] = {};
      }
      this.$set(this.executed[scale], command, {
        sha256_digest: this.sha256_digest,
        scale,
        // args,
        command,
        output: null,
        format: this.format,
        status: 'running',
      });
      postScaleInterface(
        scale,
        type,
        command,
        this.sha256_digest,
        { args: this.arguments, format: this.format, timeout: this.timeout },
      ).then((resp) => {
        if (resp.status === 'success') {
          this.$set(this.executed[scale], command, {
            sha256_digest: this.sha256_digest,
            scale,
            // args,
            command,
            output: resp.data.interface,
            format: this.format,
            status: 'success',
          });
          this.executed = Object.assign({}, this.executed);
        } else {
          this.format = 'json';
          this.$set(this.executed[scale], command, {
            sha256_digest: this.sha256_digest,
            scale,
            // args,
            command,
            output: resp.message,
            format: 'json',
            status: 'failed',
          });
          this.executed = Object.assign({}, this.executed);
        }
      });
    },

    selectCommand(scale, type, name) {
      // TODO: Do me properly
      if (this.selectedScale === scale &&
          this.selectedType === type &&
          this.selectedCommand === name) {
        return;
      }
      // Only activate if not in executed
      if (typeof this.executed[scale] === 'undefined' || typeof this.executed[scale][name] === 'undefined') {
        // NOTE: Don't run pushers by default
        if (type === 'push') {
          this.showDetails = true;
          this.selectedScale = scale;
          this.selectedType = type;
          this.selectedCommand = name;
          // XXX: Should get them from exec otherwise need blanking
          // this.arguments = this.commandArguments(scale, type, name);
          this.format = this.executed[scale][name].format;
          this.timeout = this.executed[scale][name].timeout;
          return;
        }
        this.activateCommand(scale, type, name);
      } else {
        this.selectedScale = scale;
        this.selectedType = type;
        this.selectedCommand = name;
        // XXX: Should get them from exec otherwise need blanking
        // this.arguments = this.commandArguments(scale, type, name);
        this.format = this.executed[scale][name].format;
        this.timeout = this.executed[scale][name].timeout;
      }
    },

    activateCommand(scale, type, name) {
      this.selectedScale = scale;
      this.selectedType = type;
      this.selectedCommand = name;

      this.arguments = {};
      this.showDetails = false;
      this.timeout = '600';

      // Handle formats
      let supportedFormats = [];
      let commands = [];
      if (type === 'pull') {
        commands = this.scales[scale].pullers;
      } else if (type === 'push') {
        commands = this.scales[scale].pushers;
      }
      commands.some((command) => {
        if (command.command === name) {
          supportedFormats = command.formats;
          return true;
        }
        return false;
      });
      this.formats = FORMATS.slice();
      FORMATS.forEach((format) => {
        if (supportedFormats.indexOf(format) === -1) {
          this.formats.splice(this.formats.indexOf(format), 1);
        }
      });
      [this.format] = this.formats;
      this.changeFormat(this.format);
    },

    // Helper functions
    commandArguments(scale, type, name) {
      let args = {};
      if (typeof this.scales[scale] !== 'undefined') {
        let commands = [];
        if (type === 'pull') {
          commands = this.scales[scale].pullers;
        } else if (type === 'push') {
          commands = this.scales[scale].pushers;
        }
        commands.some((command) => {
          if (command.command === name) {
            ({ args } = command);
            return true;
          }
          return false;
        });
      }
      return args;
    },

    commandOutput(scale, _type, name) {
      if (typeof this.executed[scale] !== 'undefined' && typeof this.executed[scale][name] !== 'undefined') {
        return this.executed[scale][name].output;
      }
      return '';
    },

    commandStatus(scale, _type, name) {
      if (typeof this.executed[scale] !== 'undefined' && typeof this.executed[scale][name] !== 'undefined') {
        return this.executed[scale][name].status;
      }
      return '';
    },

    commandTimestamp(scale, _type, name) {
      if (typeof this.executed[scale] !== 'undefined' && typeof this.executed[scale][name] !== 'undefined') {
        return this.executed[scale][name].timestamp;
      }
      return '';
    },

    isFailed(scale, type, command) {
      return this.commandStatus(scale, type, command) === 'failed';
    },

    isPending(scale, type, command) {
      return this.commandStatus(scale, type, command) === 'pending';
    },

    isRunning(scale, type, command) {
      return this.commandStatus(scale, type, command) === 'running';
    },

    isSuccess(scale, type, command) {
      return this.commandStatus(scale, type, command) === 'success';
    },

    renderMarkdown(scale, type, name) {
      const output = this.commandOutput(scale, type, name);
      if (output === null) {
        return marked('');
      }
      return marked(output);
    },
  },

  watch: {
    interfaces() {
      // Put in inactive unless in active
      Object.entries(this.interfaces).forEach(([k, v]) => {
        this.$set(this.scales, k, v);
      });
    },
  },
};
</script>

<style scoped lang="scss">
#interface {
  overflow: auto;
}

h2.menu-label {
  color: black;
}

.menu-list {
  a {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    font-size: 0.8rem;
  }
  .menu-label {
    padding-left: 0;
  }
}

.content {
  display: flex;
  flex-direction: column;
  height: 77vh;
  margin-left: 200px;
  overflow: hidden;
  padding-left: 1rem;
}

.content-header {
  border-bottom: 1px solid #999;
  padding-bottom: 0.5rem;
}

.content-body {
  height: 100%;
  min-height: 50px;
  overflow: auto;
  position: relative;
  pre {
    padding: 0;
  }
}

.icon-button {
  background-color: transparent;
  border: none;
  color: currentColor;
  cursor: pointer;
  margin: auto;
  padding: 0;
}

.scale {
  color: black;
}

.sidebar {
  border-right: 1px solid #999;
  height: 78vh;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  width: 200px;
}

.submenu-label {
  margin-bottom:0;
  margin-left:0.5rem;
}

.spin {
  animation: spin 1s 0s infinite linear;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
