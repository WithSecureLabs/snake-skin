<template>
  <div id="analysis" class="analysis">

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
          <b-collapse :open="true" class="menu-section" v-for="(v, k) in activeScales" :key=k>
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

            <!-- Commands -->
            <ul class="menu-list">
              <command v-for="(data, command) in v.commands" :key="k + ':' + command"
                       :scale="k"
                       :command="data"
                       :selected.sync="selected"
                       :run-command="runCommand"
              ></command>
            </ul>
          </b-collapse>
        </ul>

        <!-- Spacer -->
        <ul class="menu-list spacer"></ul>

        <!-- Inactive List -->
        <ul class="menu-list">
          <li v-for="(v, k) in inactiveScales" :key=k>
            <a class="menu-label" @click="v.active = true">{{ k }}</a>
          </li>
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
              <!-- TODO -->
              <p class="heading">
                Arguments
                <a v-if="selectedCommand"
                   @click="showArguments = !showArguments"
                >({{ showArgumentsText }})</a>
              </p>
              <b-dropdown disabled>
                <button class="button is-outlined" slot="trigger">
                  <span>defaults</span>
                  <b-icon icon="menu-down"></b-icon>
                </button>
                <!--
                <b-dropdown-item v-for="format in formats"
                                 :key=format
                                 @click="changeFormat(format)"
                >{{ format }}</b-dropdown-item>
                -->
              </b-dropdown>
            </div>
          </div>
          <div class="level-item">
            <div>
              <p class="heading">Format</p>
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
        </div>
        <div class="level-right">
          <div class="level-item">
            <div>
              <p class="heading">Submission Time</p>
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
        <!-- Timeout field -->
        <b-field v-if="selectedCommand" label="Timeout">
          <b-input type="number"
                   v-model="selectedCommand.timeout"
                   placeholder="Enter Timeout... (default: 600)"
          ></b-input>
        </b-field>
        <app-arguments v-if="selectedCommand"
                       :arguments="getArguments"
                       :data="selectedCommand.args"
        ></app-arguments>
      </div>

      <!-- Content -->
      <output-content v-if="selectedCommand"
                      :format="selectedCommand.format"
                      :loading="isLoading(selectedCommand)"
                      :output="selectedCommand.output"
      ></output-content>
      <pre v-else>No Command Selected...</pre>
    </div>
  </div>
</template>

<script>
import Arguments from '@/components/viewer/Arguments.vue';
import Command from '@/components/viewer/Command.vue';
import Output from '@/components/viewer/Output.vue';
import { postCommand, getCommand, getCommands } from '@/api/command';
import { FORMATS } from '@/settings';
import { sorted, toCaps } from '@/utils/helpers';

export default {
  name: 'Analysis',
  components: {
    'app-arguments': Arguments,
    command: Command,
    'output-content': Output,
  },
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
    executed: [], // All executions for a given command
    filter: '', // Scale sidebar filter
    format: '', // Current format
    formats: [], // Supported formats for selected command
    polling: false, // Polling for commands
    scales: {}, // Scales and their commands, based on the commands prop
    selected: ':', // Currently selected scale:command TODO: Make computed
    showArguments: false, // Toggle argument panel
  }),

  created() {
    // Load in the default formats
    this.formats = FORMATS;
    [this.format] = this.formats;
  },

  computed: {
    activeScales() {
      const scales = {};
      Object.entries(this.scales).forEach(([k, v]) => {
        if (v.active) {
          scales[k] = v;
        }
      });
      return this.filtered(scales);
    },

    inactiveScales() {
      const scales = {};
      Object.entries(this.scales).forEach(([k, v]) => {
        if (!v.active) {
          scales[k] = v;
        }
      });
      return this.filtered(scales);
    },

    selectedCommand() {
      const [scale, command] = this.selected.split(':');
      if (scale === '' || command === '') {
        return null;
      }
      return this.scales[scale].commands[command].command;
    },

    showArgumentsText() {
      if (this.showArguments) {
        return 'hide';
      }
      return 'show';
    },
  },

  methods: {
    toCaps,

    changeFormat(format) {
      // Change format then ask for the new output
      this.format = format;
      this.getSelectedCommand();
    },

    async getSelectedCommand() {
      // Get the current scale:command
      const [scale, command] = this.selected.split(':');

      // Have we run this before?
      const currentCommand = this.scales[scale].commands[command].command;
      if (currentCommand === null) {
        return;
      }

      // Ask for selected command
      const resp = await getCommand(
        this.sha256_digest,
        scale,
        command,
        { args: currentCommand.args, format: this.format },
      );

      // Update the current command
      if (resp.status === 'success') {
        const cmd = resp.data.command;
        // Blankout timeout if it is default
        if (cmd.timeout === 600) {
          cmd.timeout = '';
        }
        // Update
        this.scales[scale].commands[command].command = cmd;
      } else if (resp.status === 'error') {
        // Create a dummy object
        const cmd = resp.data;
        cmd.output = resp.message;
        cmd.timeout = '';
        this.scales[scale].commands[command].command = cmd;
      } else {
        this.scales[scale].commands[command].command = null;
      }
    },

    filtered(dict) {
      // Sort a dictionary of data by key while filtering the key based on the filter string
      let d = sorted(dict);
      if (this.filter !== '') {
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

    pollCommands() {
      if (this.polling) {
        return;
      }
      this.polling = true;
      // Loop through the executed dictionary for pendings and runnings pushing these for query
      // TODO: Don't ask for output until we hit finished!
      // TODO: Handle args too
      // TODO: Only get what we need...
      const cmds = {};
      Object.entries(this.scales).forEach(([scale, { commands }]) => {
        Object.entries(commands).forEach(([command, data]) => {
          if (data.command && (this.isPending(data.command) || this.isRunning(data.command))) {
            cmds[scale + command] = null;
          }
        });
      });

      // Query what we have above
      if (Object.keys(cmds).length > 0) {
        getCommands({ SHA256Diges: this.sha256_digest }).then((resp) => {
          if (resp.status === 'success') {
            const { commands } = resp.data;
            let shouldPoll = false;
            commands.forEach((cmd) => {
              if (typeof cmds[cmd.scale + cmd.command] !== 'undefined') {
                // Do we still need to poll?
                if (typeof cmd.end_time === 'undefined') {
                  shouldPoll = true;
                }
                // Are we the current command?
                // TODO: Couple more edge cases to handle here
                const [scale, command] = this.selected.split(':');
                if (scale === cmd.scale && command === cmd.command) {
                  // Now are we the active one?
                  const currentCommand = this.scales[cmd.scale].commands[cmd.command].command;
                  if (JSON.stringify(currentCommand.args) === JSON.stringify(cmd.args)) {
                    this.scales[cmd.scale].commands[cmd.command].command = cmd;
                    // Are we finished?
                    if (!this.isPending(cmd) && !this.isRunning(cmd)) {
                      this.getSelectedCommand();
                    }
                  }
                  // TODO: Populate executed
                } else {
                  this.scales[cmd.scale].commands[cmd.command].command = cmd;
                }
              }
              // Merge then force update
              this.scales = Object.assign({}, this.scales);
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
      // TODO: Take name not object
      // Queue it and leave the work to poll, assume pending
      const cmd = this.scales[scale].commands[command.name].command;
      let { timeout } = cmd;
      if (this.timeout === '') {
        timeout = 600;
      }
      const { args } = cmd;
      postCommand(
        this.sha256_digest,
        scale,
        command.name, // TODO:
        { args, timeout },
      ).then((resp) => {
        if (resp.status === 'success') {
          this.scales[scale].commands[command.name].command = resp.data.command;
          this.pollCommands();
        }
      });
    },

    isFailed(command) {
      return command.status === 'failed';
    },
    isPending(command) {
      return command.status === 'pending';
    },
    isRunning(command) {
      return command.status === 'running';
    },
    isSuccess(command) {
      return command.status === 'success';
    },
    isLoading(command) {
      return this.isPending(command) || this.isRunning(command);
    },
  },

  watch: {
    async commands() {
      // Preprocess into a more useful format for manipulation etc...
      const scales = {};
      Object.entries(this.commands).forEach(([scale, cmds]) => {
        // Build new commands array, this will have variables that we can use for status
        const commands = {};
        cmds.forEach((cmd) => {
          commands[cmd.command] = {
            args: cmd.args,
            name: cmd.command,
            formats: cmd.formats,
            info: cmd.info,
            command: null, // Last execution
          };
        });
        scales[scale] = {
          active: false,
          commands,
        };
      });
      // Load the executed into the above
      const resp = await getCommands({ SHA256Digest: this.sha256_digest });
      if (resp.status === 'success') {
        const cmds = resp.data.commands;
        cmds.forEach((cmd) => {
          // We could have legacy scales in the commands db so we need to ignore those
          if (Object.keys(scales).indexOf(cmd.scale) !== -1) {
            scales[cmd.scale].active = true;
            scales[cmd.scale].commands[cmd.command].command = cmd;
          }
        });
      }

      this.scales = scales;
    },

    async selected() {
      if (this.selected === '') {
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

<style lang="scss" scoped>
.analysis {
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
  overflow: auto;
}

.main {
  padding: 0.5rem;
  width: calc(100vw - 500px);

  .level {
    margin: 0;
    padding-bottom: 0.5rem
  }
}

.sidebar {
  border-right: 1px solid #999;
  padding: 0.5rem;
  min-width: 250px;
  width: 250px;
}

.spacer {
  height: 1rem;
}
</style>
