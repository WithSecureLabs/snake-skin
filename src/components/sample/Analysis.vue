<template>
  <div id="analysis" class="analysis">
    <div class="sidebar">
      <input id="input"
            class="input"
            type="text"
            v-model="searchText"
            placeholder="Scale..."
            style="width:190px"
      >
      <div>
        <!--<h2 class="menu-label">Active</h2>-->
        <ul class="menu-list">
          <b-collapse :open="true" class="menu-section" v-for="(v, k) in sorted(active)" :key=k>
          <a slot="trigger" class="menu-label submenu-label" slot-scope="props">
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
          <ul class="menu-list">
            <li>
              <a v-for="cmd in v" :key="k + cmd.command"
                 :class="{'is-active': isActive(k, cmd.command)}"
                 @click="selectCommand(k, cmd.command)">
                <div class="level">
                  <div class="level-left">
                    - {{ cmd.command }}
                  </div>
                  <div class="level-right">
                    <i v-if="isPending(k, cmd.command)"
                       class="mdi mdi-dots-horizontal mdi-18px"
                       aria-hidden="true"></i>
                    <i v-if="isRunning(k, cmd.command)"
                       class="mdi mdi-loading mdi-18px spin"
                       aria-hidden="true"></i>
                    <i v-if="isSuccess(k, cmd.command)"
                       class="mdi mdi-check mdi-18px"
                       aria-hidden="true"></i>
                    <i v-if="isFailed(k, cmd.command)"
                       class="mdi mdi-close mdi-18px"
                       aria-hidden="true"></i>
                    <div>
                      <i v-tooltip="{
                          content: cmd.info,
                          placement: 'bottom',
                          classes: ['tooltip'],
                         }"
                         class="mdi mdi-information mdi-18px" aria-hidden="true"></i>
                      <button :disabled="isPending(k, cmd.command) || isRunning(k, cmd.command)"
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
        </b-collapse>
      </ul>
      <!--<h2 class="menu-label">Inactive</h2>-->
      <ul class="menu-list spacer"></ul>
        <ul class="menu-list">
          <li v-for="(v, k) in sorted(inactive)" :key=k>
            <a class="menu-label" @click="makeActive(k)">{{ k }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="selectedScale && selectedCommand" class="content">
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
              <span v-if="commandTimestamp(selectedScale, selectedCommand)">
                Submitted Time: {{ commandTimestamp(selectedScale, selectedCommand) }}
              </span>
              <span v-else>Submitted Time: Not Run</span>
            </div>
          </div>
        </div>
        <div v-if="showDetails">
          <b-field label="Timeout">
            <b-input type="number"
                     v-model="timeout"
                     placeholder="Enter Timeout... (default: 600)"
            ></b-input>
          </b-field>
          <template v-for="(v, k) in commandArguments(selectedScale, selectedCommand)">
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
               v-html="renderMarkdown(selectedScale, selectedCommand)"
               class="markdown"
               style="height:100%"
          ></div>
          <pre v-else style="height:100%">{{ getExecuted.output }}</pre>
        </div>
        <b-loading :is-full-page="false"
                   :active="isLoading(selectedScale, selectedCommand)"
                   :can-cancel="false"
        ></b-loading>
      </div>
    </div>
  </div>
</template>

<script>
import highlightjs from 'highlightjs';
import { postCommand, getCommand, getCommands } from '@/api/command';
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
  name: 'Analysis',
  props: {
    commands: {
      default: () => {},
      type: Object,
    },
    sha256_digest: {
      default: () => null,
      type: String,
    },
  },
  data: () => ({
    active: {},
    arguments: {},
    executed: {},
    format: 'json',
    formats: [],
    inactive: {},
    polling: false,
    searchText: '',
    showDetails: false,
    selectedScale: null,
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
    this.loadExecuted();
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
      getCommand(
        this.sha256_digest,
        this.selectedScale,
        this.selectedCommand,
        { format },
      ).then((resp) => {
        if (resp.status === 'success') {
          const { command } = resp.data;
          if (typeof this.executed[command.scale] === 'undefined') {
            this.executed[command.scale] = {};
          }
          this.$set(this.executed[command.scale], command.command, command);
          this.executed = Object.assign({}, this.executed);
        }
      });
    },

    isActive(scale, command) {
      return this.selectedScale === scale && this.selectedCommand === command;
    },

    isLoading(scale, command) {
      return this.isPending(scale, command) || this.isRunning(scale, command);
    },

    loadExecuted() {
      getCommands({ SHA256Digest: this.sha256_digest }).then((resp) => {
        if (resp.status === 'success') {
          const { commands } = resp.data;
          commands.forEach((command) => {
          // Create scale entry if not set
            if (Object.keys(this.executed).indexOf(command.scale) === -1) {
              this.executed[command.scale] = {};
            }
            // Move to active if not set
            if (Object.keys(this.active).indexOf(command.scale) === -1) {
              this.$set(this.active, command.scale, this.inactive[command.scale]);
              delete this.inactive[command.scale];
            }
            this.$set(this.executed[command.scale], command.command, command);
          });
        }
      });
    },

    makeActive(scale) {
      this.$set(this.active, scale, this.inactive[scale]);
      delete this.inactive[scale];
    },

    pollCommands() {
      if (this.polling) {
        return;
      }
      this.polling = true;

      // Loop through the executed dictionary for pendings and runnings pushing these for query
      // TODO: Don't ask for output until we hit finished!
      // const cmds = [];
      const cmds = {};
      Object.entries(this.executed).forEach(([scale, commands]) => {
        Object.entries(commands).forEach(([command, data]) => {
          if (data.status === 'pending' || data.status === 'running') {
            // cmds.push({
            //   sha256_digest: this.sha256_digest,
            //   scale,
            //   command,
            // });
            cmds[scale + command] = null;
          }
        });
      });

      if (Object.keys(cmds).length > 0) {
        // XXX: GETS are not allowed to have a body, so we need to extend the
        // snake-core to handle a 'GET' in the POST even though snake-core accepts
        // GETs with bodies clients don't like to allow this
        // NOTE: Until we have GET in POST this can't be used, we have to just request everything :S
        getCommands({ SHA256Diges: this.sha256_digest }).then((resp) => {
          if (resp.status === 'success') {
            const { commands } = resp.data;
            let shouldPoll = false;
            commands.forEach((cmd) => {
              const command = cmd;
              if (typeof cmds[command.scale + command.command] !== 'undefined') {
                const executedCmd = this.executed[command.scale][command.command];
                if (typeof command.end_time === 'undefined') {
                  shouldPoll = true;
                }
                if (this.selectedScale === command.scale &&
                this.selectedCommand === command.command) {
                // Queue for formatted retrieval if the active command
                  this.activateCommand(command.scale, command.command);
                } else {
                  delete command.output;
                  this.executed[command.scale][command.command] =
                    Object.assign(executedCmd, command);
                }
                // Merge then force update
                this.executed = Object.assign({}, this.executed);
              }
            });
            this.polling = false;
            if (shouldPoll) {
              setTimeout(() => { this.pollCommands(); }, 5000);
            }
          }
        });
      } else {
        this.polling = false;
      }
    },

    runCommand(scale, command) {
      let { timeout } = this;
      if (this.timeout === '') {
        timeout = 600;
      }

      postCommand(
        this.sha256_digest,
        scale,
        command,
        { args: this.arguments, timeout },
      ).then((resp) => {
        if (typeof this.executed[scale] === 'undefined') {
          this.executed[scale] = {};
        }
        if (resp.status === 'success') {
          this.$set(this.executed[scale], command, resp.data.command);
          this.pollCommands();
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

    selectCommand(scale, name) {
      if (this.selectedScale === scale && this.selectedCommand === name) {
        return;
      }
      this.activateCommand(scale, name);
    },

    activateCommand(scale, name) {
      this.selectedScale = scale;
      this.selectedCommand = name;

      this.arguments = {};
      this.showDetails = false;
      this.timeout = '';

      // Handle formats
      let supportedFormats = [];
      this.active[scale].some((command) => {
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
    commandArguments(scale, name) {
      let args = {};
      if (typeof this.active[scale] !== 'undefined') {
        this.active[scale].some((command) => {
          if (command.command === name) {
            ({ args } = command);
            return true;
          }
          return false;
        });
      }
      return args;
    },

    commandOutput(scale, name) {
      if (typeof this.executed[scale] !== 'undefined' && typeof this.executed[scale][name] !== 'undefined') {
        return this.executed[scale][name].output;
      }
      return '';
    },

    commandStatus(scale, name) {
      if (typeof this.executed[scale] !== 'undefined' && typeof this.executed[scale][name] !== 'undefined') {
        return this.executed[scale][name].status;
      }
      return '';
    },

    commandTimestamp(scale, name) {
      if (typeof this.executed[scale] !== 'undefined' && typeof this.executed[scale][name] !== 'undefined') {
        return this.executed[scale][name].timestamp;
      }
      return '';
    },

    isFailed(scale, command) {
      return this.commandStatus(scale, command) === 'failed';
    },

    isPending(scale, command) {
      return this.commandStatus(scale, command) === 'pending';
    },

    isRunning(scale, command) {
      return this.commandStatus(scale, command) === 'running';
    },

    isSuccess(scale, command) {
      return this.commandStatus(scale, command) === 'success';
    },

    renderMarkdown(scale, name) {
      const output = this.commandOutput(scale, name);
      if (output === null) {
        return marked('');
      }
      return marked(output);
    },
  },

  watch: {
    commands() {
      // Put in inactive unless in active
      Object.entries(this.commands).forEach(([k, v]) => {
        if (Object.keys(this.active).indexOf(k) === -1) {
          this.$set(this.inactive, k, v);
        } else {
          this.$set(this.active, k, v);
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
#analysis {
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

.spacer {
  height: 1rem;
}

.submenu-label {
  padding-bottom: 0;
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
