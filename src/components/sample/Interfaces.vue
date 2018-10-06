<template>
  <div id="interfaces" class="interfaces">

    <!-- Sidebar -->
    <div class="sidebar">
      <p class="heading">Scales</p>

      <!-- Scales Filter -->
      <input id="input"
            class="input"
            type="text"
            v-model="filter"
            placeholder="Scale..."
      >

      <div class="lists">
        <!-- Active List -->
        <ul class="menu-list">

          <!-- Scale -->
          <b-collapse :open="true" class="menu-section" v-for="(v, k) in filtered(scales)" :key=k>
            <a slot="trigger" class="menu-label submenu-label" slot-scope="props">
              <div class="level">
                <div class="level-left">
                  <span class="scale">{{ k }}</span>
                </div>
                <div class="level-right">
                  <i class="mdi mdi-18px"
                     :class="props.open ? 'mdi-menu-down' : 'mdi-menu-right'"
                     aria-hidden="true"
                  ></i>
                </div>
              </div>
            </a>

            <!-- Pullers -->
            <template v-if="Object.keys(pullers(k)).length > 0">
              <span class="menu-label submenu-label subsubmenu-label">Pullers</span>
              <ul class="menu-list">
                <app-command v-for="(data, command) in pullers(k)" :key="k + ':' + command"
                             :scale="k"
                             :command="command"
                             :data="data"
                             :selected.sync="selected"
                             :run-command="runCommand"
                ></app-command>
              </ul>
            </template>

            <!-- Pushers -->
            <template v-if="Object.keys(pushers(k)).length > 0">
              <span class="menu-label submenu-label subsubmenu-label">Pullers</span>
              <ul class="menu-list">
                <app-command v-for="(data, command) in pushers(k)" :key="k + ':' + command"
                             :scale="k"
                             :command="command"
                             :data="data"
                             :selected.sync="selected"
                             :run-command="runCommand"
                ></app-command>
              </ul>
            </template>
          </b-collapse>
        </ul>
      </div>
    </div>

    <!-- Content -->
    <div class="main">
      <!-- Header -->
      <div class="header level">
        <div class="level-left">
          <div class="level-item">
            <div>
              <p class="heading">
                Arguments
              </p>
              <button class="button"
                      :disabled="!selectedCommand"
                      @click="showArguments = !showArguments">
                Toggle Arguments
              </button>
            </div>
          </div>
          <div class="level-item">
            <div>
              <p class="heading">Format</p>
              <b-dropdown :disabled="selectedCommand && selectedCommand.type === 'push'">
                <button class="button is-outlined" slot="trigger">
                  <span>{{ toCaps(format) }}</span>
                  <b-icon icon="menu-down"></b-icon>
                </button>
                <b-dropdown-item v-for="format in formats"
                                 :key=format
                                 @click="changeFormat(format)"
                >{{ toCaps(format) }}</b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <div>
              <p class="heading">Timestamp</p>
              <p v-if="selectedCommand && selectedCommand.timestamp">
                {{ selectedCommand.timestamp }}
              </p>
              <p v-else>N/A</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Arguments -->
      <div v-if="showArguments" class="arguments-list">
        <app-arguments v-if="activeCommand"
                       :arguments="activeCommand.args"
                       :data="activeCommand.working.args"
                       :invalid="activeCommand.working.invalid"
        ></app-arguments>
      </div>

      <!-- Content -->
      <output-content v-if="selectedCommand"
                      :format="selectedCommand.format"
                      :loading="selectedCommand.loading"
                      :output="selectedCommand.output"
      ></output-content>
      <pre v-else-if="activeCommand">Command Never Executed...</pre>
      <pre v-else>No Command Selected...</pre>
    </div>
  </div>
</template>

<script>
import Arguments from '@/components/sample/Arguments.vue';
import Command from '@/components/sample/Command.vue';
import Output from '@/components/sample/Output.vue';
import { postScaleInterface } from '@/api/scale';
import { FORMATS } from '@/settings';
import { sorted, toCaps } from '@/utils/helpers';

export default {
  name: 'Interfaces',
  components: {
    'app-arguments': Arguments,
    'app-command': Command,
    'output-content': Output,
  },
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
    filter: '', // Scale sidebar filter
    format: '', // Current format
    formats: [], // Supported formats for selected command
    scales: {}, // Scales and their interfaces, based on the interfaces prop
    selected: ':', // Currently selected scale:command
    showArguments: false, // Toggle argument panel
  }),

  created() {
    // Load in the default formats
    this.formats = FORMATS;
    [this.format] = this.formats;
  },

  computed: {
    activeCommand() {
      const [scale, command] = this.selected.split(':');
      if (scale === '' || command === '') {
        return null;
      }
      return this.scales[scale].commands[command];
    },

    selectedCommand() {
      const selectedCommand = this.activeCommand;
      if (selectedCommand === null) {
        return null;
      }
      return selectedCommand.executed;
    },
  },

  methods: {
    toCaps,

    changeFormat(format) {
      // Change format then ask for the new output
      this.format = format;
      this.getSelectedCommand();
    },

    filtered(dict) {
      // Sort a dictionary of data by key while filtering the key based on the filter string
      let d = sorted(dict);
      if (this.filter !== '') {
        const temp = {};
        Object.entries(d).forEach(([k, v]) => {
          if (k.includes(this.filter)) {
            temp[k] = v;
          }
        });
        d = temp;
      }
      return d;
    },

    async getSelectedCommand() {
      // Get the data required for the query
      const [scale, command] = this.selected.split(':');
      const selectedCmd = this.scales[scale].commands[command];
      const { executed } = selectedCmd;
      if (selectedCmd.type === 'push') {
        if (executed === null) {
          this.showArguments = true;
        }
      } else if (executed === null) {
        this.runCommand(scale, command);
      } else if (executed.format !== this.format) {
        this.runCommand(scale, command);
      }
    },

    pullers(scale) {
      const commands = {};
      Object.entries(this.scales[scale].commands).forEach(([k, v]) => {
        if (v.type === 'pull') {
          commands[k] = v;
        }
      });
      return commands;
    },

    pushers(scale) {
      const commands = {};
      Object.entries(this.scales[scale].commands).forEach(([k, v]) => {
        if (v.type === 'push') {
          commands[k] = v;
        }
      });
      return commands;
    },

    runCommand(scale, command) {
      // Get the selected command
      const selectedCmd = this.scales[scale].commands[command];
      selectedCmd.loading = true;
      let args = {};
      if (typeof selectedCmd.working.args !== 'undefined') {
        ({ args } = selectedCmd.working);
      }
      postScaleInterface(
        scale,
        selectedCmd.type,
        command,
        this.sha256_digest,
        { args, format: this.format, timeout: 600 },
      ).then((resp) => {
        if (resp.status === 'success') {
          const cmd = resp.data.interface;
          selectedCmd.executed = cmd;
          selectedCmd.working = Object.assign({}, cmd);
        } else {
          const cmd = resp.data;
          cmd.output = resp.message;
          selectedCmd.executed = cmd;
          selectedCmd.working = Object.assign({}, cmd);
        }
        // Force an update
        this.scales = Object.assign({}, this.scales);
        selectedCmd.loading = false;
      });
    },
  },

  watch: {
    interfaces() {
      // Preprocess into a more useful format for manipulation etc...
      const scales = {};
      Object.entries(this.interfaces).forEach(([scale, cmds]) => {
        // Build new commands array, this will have variables that we can use for status
        const commands = {};
        cmds.forEach((cmd) => {
          commands[cmd.command] = {
            args: cmd.args,
            name: cmd.command,
            formats: cmd.formats,
            info: cmd.info,
            loading: false,
            executed: null, // The executed command
            type: cmd.type,
            working: { // The working copy
              args: {},
            },
          };
        });
        scales[scale] = {
          commands,
        };
      });
      this.scales = Object.assign({}, scales);
    },

    async selected() {
      if (this.selected === ':') {
        return;
      }
      const [scale, command] = this.selected.split(':');
      const supportedFormats = this.scales[scale].commands[command].formats;
      this.formats = FORMATS.slice();
      FORMATS.forEach((format) => {
        if (supportedFormats.indexOf(format) === -1) {
          this.formats.splice(this.formats.indexOf(format), 1);
        }
      });
      [this.format] = this.formats;
      this.getSelectedCommand();
    },
  },
};
</script>

<style scoped lang="scss">
.interfaces {
  display: flex;
  height: 100%;
}

.arguments-list {
  border-bottom: 1px solid #999;
  padding: 0.5rem 0;
}

.header {
  border-bottom: 1px solid #999;
}

.lists {
  height: 100%;
  overflow: auto;
}

.main {
  display: flex;
  flex-flow: column;
  padding: 0.5rem;
  width: calc(100vw - 500px);

  .level {
    margin: 0;
    padding-bottom: 0.5rem
  }
}

.sidebar {
  border-right: 1px solid #999;
  display: flex;
  flex-flow: column;
  padding: 0.5rem;
  min-width: 250px;
  width: 250px;
}

.spacer {
  height: 1rem;
}

.subsubmenu-label {
  font-size: 0.75rem;
  padding: 0 0.5rem;
}
</style>
