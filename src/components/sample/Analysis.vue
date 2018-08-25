<template>
  <div id="analysis" class="analysis">
    <div class="sidebar">
      <h2 class="menu-label">Active</h2>
        <ul class="menu-list">
      <b-collapse :open="true" class="menu-section" v-for="(v, k) in sorted(active)" :key=k>
        <a slot="trigger" class="menu-label">{{ k }} </a>
        <ul class="menu-list">
          <li>
            <a v-for="cmd in v" :key="k + cmd.command"
               :class="{'is-active': isActive(k, cmd.command)}"
               @click="selectCommand(k, cmd.command)">
              <div class="level">
                <div class="level-left">
                  {{ cmd.command }}
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
      <h2 class="menu-label">Inactive</h2>
      <ul class="menu-list">
        <li v-for="(v, k) in sorted(inactive)" :key=k>
          <a class="menu-label" @click="makeActive(k)">{{ k }}</a>
        </li>
      </ul>
    </div>
    <div v-if="selectedScale && selectedCommand" class="content">
      <div class="level content-header">
        <div class="level-left">
          <b-collapse class="level-item">
            <div slot="trigger" slot-scope="props">
              <i class="mdi mdi-18px"
                 :class="props.open ? 'mdi-menu-right' : 'mdi-menu-down'"
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
            <b-dropdown-item v-for="format in formats" @click="changeFormat(format)">{{ format }}</b-dropdown-item>
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
      <div class="content-body">
        {{ getExecuted.output }}
        <b-loading :is-full-page="false"
                   :active="isLoading(selectedScale, selectedCommand)"
                   :can-cancel="false"
        ></b-loading>
      </div>
    </div>
  </div>
</template>

<script>
import { postCommand, getCommand, getCommands } from '@/api/command';
import { FORMATS } from '@/settings';

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
    executed: {},
    format: 'json',
    formats: [],
    inactive: {},
    polling: false,
    selectedScale: null,
    selectedCommand: null,
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
    changeFormat(format) {
      getCommand(
        this.sha256_digest,
        this.selectedScale,
        this.selectedCommand,
        { format },
      ).then((command) => {
        this.$set(this.executed[command.scale], command.command, command);
        this.executed = Object.assign({}, this.executed);
      });
    },

    isActive(scale, command) {
      return this.selectedScale === scale && this.selectedCommand === command;
    },

    isLoading(scale, command) {
      return this.isPending(scale, command) || this.isRunning(scale, command);
    },

    loadExecuted() {
      getCommands(this.sha256_digest).then((commands) => {
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
      // TODO: Don't be lazy, causes problems atm
      getCommands(this.sha256_digest).then((commands) => {
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

          // Delete output and merge
          delete command.output;
          this.executed[command.scale][command.command] = Object.assign(this.executed[command.scale][command.command], command);

          // Merge then force update
          this.executed = Object.assign({}, this.executed);
        });
        this.polling = false;
        setTimeout(() => { this.pollCommands(); }, 5000);
      });
    },

    runCommand(scale, command) {
      postCommand(this.sha256_digest, scale, command).then((result) => {
        this.$set(this.executed[scale], command, result);
        this.pollCommands();
      });
    },

    selectCommand(scale, name) {
      this.selectedScale = scale;
      this.selectedCommand = name;

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

    sorted(unordered) {
      const ordered = {};
      Object.keys(unordered).sort().forEach((key) => {
        ordered[key] = unordered[key];
      });
      return ordered;
    },

    // Helper functions
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
  height: 77vh;
  margin-left: 200px;
  overflow: auto;
  padding-left: 1rem;
}

.content-header {
  border-bottom: 1px solid #999;
  padding-bottom: 0.5rem;
}

.content-body {
  min-height: 50px;
  overflow: auto;
  position: relative;
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
