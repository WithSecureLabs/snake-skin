<template>
  <div id="interfaces" class="interfaces">
    <div class="sidebar">
      <ul class="menu-list">
        <b-collapse :open="true" class="menu-section" v-for="(v, k) in sorted(scales)" :key=k>
        <a slot="trigger" class="menu-label" slot-scope="props">
          <div class="level">
          <div class="level-left">
          <span>{{ k }}</span>
          </div>
          <div class="level-right">
          <i class="mdi mdi-18px"
             :class="props.open ? 'mdi-menu-down' : 'mdi-menu-right'"
             aria-hidden="true"></i>
          </div>
          </div>
        </a>
        <template v-if="v.pullers.length > 0">
          <h2 class="menu-label">Pullers</h2>
          <ul class="menu-list">
            <li>
              <a v-for="cmd in v.pullers" :key="k + cmd.command"
                 :class="{'is-active': isActive(k, 'puller', cmd.command)}"
                 @click="selectCommand(k, 'puller', cmd.command)">
                <div class="level">
                  <div class="level-left">
                    {{ cmd.command }}
                  </div>
                  <div class="level-right">
                    <i v-if="isPending(k, 'puller', cmd.command)"
                       class="mdi mdi-dots-horizontal mdi-18px"
                       aria-hidden="true"></i>
                    <i v-if="isRunning(k, 'puller', cmd.command)"
                       class="mdi mdi-loading mdi-18px spin"
                       aria-hidden="true"></i>
                    <i v-if="isSuccess(k, 'puller', cmd.command)"
                       class="mdi mdi-check mdi-18px"
                       aria-hidden="true"></i>
                    <i v-if="isFailed(k, 'puller', cmd.command)"
                       class="mdi mdi-close mdi-18px"
                       aria-hidden="true"></i>
                    <div>
                      <i v-tooltip="{
                          content: cmd.info,
                          placement: 'bottom',
                          classes: ['tooltip'],
                         }"
                         class="mdi mdi-information mdi-18px" aria-hidden="true"></i>
                      <button :disabled="isPending(k, 'puller', cmd.command) || isRunning(k, 'puller', cmd.command)"
                              @click="runCommand(k, cmd.command)"
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
        </template>
        <template v-if="v.pushers.length > 0">
          <h2 class="menu-label">Pullers</h2>
          <ul class="menu-list">
            <li>
              <a v-for="cmd in v.pushers" :key="k + cmd.command"
                 :class="{'is-active': isActive(k, 'pusher', cmd.command)}"
                 @click="selectCommand(k, 'pusher', cmd.command)">
                <div class="level">
                  <div class="level-left">
                    {{ cmd.command }}
                  </div>
                  <div class="level-right">
                    <i v-if="isPending(k, 'pusher', cmd.command)"
                       class="mdi mdi-dots-horizontal mdi-18px"
                       aria-hidden="true"></i>
                    <i v-if="isRunning(k, 'pusher', cmd.command)"
                       class="mdi mdi-loading mdi-18px spin"
                       aria-hidden="true"></i>
                    <i v-if="isSuccess(k, 'pusher', cmd.command)"
                       class="mdi mdi-check mdi-18px"
                       aria-hidden="true"></i>
                    <i v-if="isFailed(k, 'pusher', cmd.command)"
                       class="mdi mdi-close mdi-18px"
                       aria-hidden="true"></i>
                    <div>
                      <i v-tooltip="{
                          content: cmd.info,
                          placement: 'bottom',
                          classes: ['tooltip'],
                         }"
                         class="mdi mdi-information mdi-18px" aria-hidden="true"></i>
                      <button :disabled="isPending(k, 'pusher', cmd.command) || isRunning(k, 'pusher', cmd.command)"
                              @click="runCommand(k, cmd.command)"
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
        </template>
        </b-collapse>
      </ul>
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
            <div class="level-item">
              <span v-if="commandTimestamp(selectedScale, selectedType, selectedCommand)">
                Submitted Time: {{ commandTimestamp(selectedScale, selectedType, selectedCommand) }}
              </span>
              <span v-else>Submitted Time: Not Run</span>
            </div>
          </div>
        </div>
        <div v-if="showDetails">
          <b-field label="Timeout">
            <b-input v-model="timeout" placeholder="600"></b-input>
          </b-field>
          <template v-for="(v, k) in commandArguments(selectedScale, selectedType, selectedCommand)">
            <b-field :label="k" :key="k">
              <b-input v-model="$data.arguments[k]" :placeholder="'Enter ' + k"></b-input>
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
import { pullScaleInterface, pushScaleInterface } from '@/api/scale';
import { FORMATS } from '@/settings';

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
    changeFormat(format) {
      this.format = format;
      this.runCommand(this.selectedScale, this.selectedCommand);
    },

    isActive(scale, type, command) {
      return this.selectedScale === scale &&
              this.selectedType === type &&
              this.selectedCommand === command;
    },

    isLoading(scale, type, command) {
      return this.isPending(scale, type, command) || this.isRunning(scale, type, command);
    },

    runCommand(scale, command) {
      if (this.selectedType === 'puller') {
        if (typeof this.executed[scale] === 'undefined') {
          this.executed[scale] = {};
        }
        pullScaleInterface(
          scale,
          command,
          this.sha256_digest,
          { args: this.arguments, format: this.format, timeout: this.timeout },
        ).then((result) => {
          if (result !== null) {
            if (result.status !== 'error') {
              this.$set(this.executed[scale], command, {
                sha256_digest: this.sha256_digest,
                scale,
                // args,
                command,
                output: result.data.interface,
                format: this.format,
                status: 'success',
              });
            } else {
              this.format = 'json';
              this.$set(this.executed[scale], command, {
                sha256_digest: this.sha256_digest,
                scale,
                // args,
                command,
                output: result.message,
                format: 'json',
                status: 'failed',
              });
              this.executed = Object.assign({}, this.executed);
            }
          }
        });
      } else if (this.selectedType === 'pusher') {
        if (typeof this.executed[scale] === 'undefined') {
          this.executed[scale] = {};
        }
        pushScaleInterface(
          scale,
          command,
          this.sha256_digest,
          { args: this.arguments, format: this.format, timeout: this.timeout },
        ).then((result) => {
          if (result !== null) {
            if (result.status !== 'error') {
              this.$set(this.executed[scale], command, {
                sha256_digest: this.sha256_digest,
                scale,
                // args,
                command,
                output: result.data.interface,
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
                output: result.message,
                format: 'json',
                status: 'failed',
              });
              this.executed = Object.assign({}, this.executed);
            }
          }
        });
      }
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
        if (type === 'pusher') {
          this.showDetails = true;
          return;
        }
        this.activateCommand(scale, type, name);
      } else {
        this.selectedScale = scale;
        this.selectedType = type;
        this.selectedCommand = name;
        this.arguments = this.commandArguments(scale, type, name);
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
      if (type === 'puller') {
        commands = this.scales[scale].pullers;
      } else if (type === 'pusher') {
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

    sorted(unordered) {
      const ordered = {};
      Object.keys(unordered).sort().forEach((key) => {
        ordered[key] = unordered[key];
      });
      return ordered;
    },

    // Helper functions
    commandArguments(scale, type, name) {
      let args = {};
      if (typeof this.scales[scale] !== 'undefined') {
        let commands = [];
        if (type === 'puller') {
          commands = this.scales[scale].pullers;
        } else if (type === 'pusher') {
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

    isFailed(scale, _type, command) {
      return this.commandStatus(scale, command) === 'failed';
    },

    isPending(scale, _type, command) {
      return this.commandStatus(scale, command) === 'pending';
    },

    isRunning(scale, _type, command) {
      return this.commandStatus(scale, command) === 'running';
    },

    isSuccess(scale, _type, command) {
      return this.commandStatus(scale, command) === 'success';
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

.sidebar {
  border-right: 1px solid #999;
  height: 78vh;
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  width: 200px;
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
