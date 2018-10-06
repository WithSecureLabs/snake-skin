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
              <app-command v-for="(data, command) in v.commands" :key="k + ':' + command"
                           :scale="k"
                           :command="command"
                           :data="data"
                           :selected.sync="selected"
                           :run-command="runCommand"
              ></app-command>
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
                <a v-if="activeCommand"
                   @click="showArguments = !showArguments"
                >({{ showArgumentsText }})</a>
              </p>
              <b-dropdown :disabled="!activeCommand || !activeCommand.args || !activeCommand.selected">
                <button class="button is-outlined" slot="trigger">
                  <span v-if="!activeCommand || !activeCommand.args">No Arguments</span>
                  <span v-else-if="!activeCommand.selected">{{ renderArguments({}) }}</span>
                  <span v-else>{{ renderArguments(JSON.parse(activeCommand.selected)) }}</span>
                  <b-icon icon="menu-down"></b-icon>
                </button>
                <ul v-if="activeCommand">
                  <li>
                    <b-dropdown-item v-for="(v, k) in sortExecuted(activeCommand.executed)"
                                     :key="k"
                                     @click="activeCommand.selected = k; getSelectedCommand()"
                                     style="padding:0 0 0 1rem"
                    >
                      <div class="level" style="padding:0">
                        <div class="level-left">
                          <span>{{ renderArguments(v.args) }}</span>
                        </div>
                        <div class="level-right" style="padding:0">
                          <i v-if="isPending(v)"
                             class="mdi mdi-dots-horizontal mdi-18px"
                             aria-hidden="true"
                          ></i>
                          <i v-if="isRunning(v)"
                             class="mdi mdi-loading mdi-18px spin"
                             aria-hidden="true"
                          ></i>
                          <i v-if="isSuccess(v)"
                             class="mdi mdi-check mdi-18px"
                             aria-hidden="true"
                          ></i>
                          <i v-if="isFailed(v)"
                             class="mdi mdi-close mdi-18px"
                             aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                    </b-dropdown-item>
                  </li>
                </ul>
              </b-dropdown>
            </div>
          </div>
          <div class="level-item">
            <div>
              <p class="heading">Format</p>
              <b-dropdown>
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
        <b-field label="Timeout">
          <b-input type="number"
                   v-model="activeCommand.working.timeout"
                   placeholder="Enter Timeout... (default: 600)"
          ></b-input>
        </b-field>
        <app-arguments v-if="activeCommand"
                       :arguments="activeCommand.args"
                       :data="activeCommand.working.args"
                       :invalid="activeCommand.working.invalid"
        ></app-arguments>
      </div>

      <!-- Content -->
      <output-content v-if="selectedCommand"
                      :format="selectedCommand.format"
                      :loading="isLoading(selectedCommand)"
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
import { postCommand, getCommand, getCommands } from '@/api/command';
import { FORMATS } from '@/settings';
import { sorted, toCaps } from '@/utils/helpers';

export default {
  name: 'Analysis',
  components: {
    'app-arguments': Arguments,
    'app-command': Command,
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
    filter: '', // Scale sidebar filter
    polling: false, // Polling for commands
    scales: {}, // Scales and their commands, based on the commands prop
    selected: ':', // Currently selected scale:command
    showArguments: false, // Toggle argument panel

    // TODO: Should be per command
    format: '', // Current format
    formats: [], // Supported formats for selected command
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
      return selectedCommand.executed[selectedCommand.selected];
    },

    showArgumentsText() {
      if (this.showArguments) {
        return 'hide';
      }
      return 'show';
    },
  },

  methods: {
    sorted,
    toCaps,

    changeFormat(format) {
      // Change format then ask for the new output
      this.format = format;
      this.getSelectedCommand();
    },

    async getSelectedCommand() {
      // Get the data required for the query
      const [scale, command] = this.selected.split(':');
      const selectedCmd = this.scales[scale].commands[command];
      const key = selectedCmd.selected;
      if (key === null) {
        return;
      }
      const executed = selectedCmd.executed[key];
      if (typeof executed === 'undefined') {
        return;
      }

      // Run query
      const resp = await getCommand(
        this.sha256_digest,
        scale,
        command,
        { args: executed.args, format: this.format },
      );

      // Update the object
      if (resp.status === 'success') {
        const cmd = resp.data.command;
        if (cmd.status === 'failed' && !cmd.output) {
          cmd.output = 'Command failed'; // XXX: The core should do this
        }
        // Update
        selectedCmd.executed[key] = cmd;
        // Blank out defaults
        selectedCmd.working = Object.assign({}, cmd);
        if (selectedCmd.working.timeout === 600) {
          delete selectedCmd.working.timeout;
        }
      } else if (resp.status === 'error') {
        // Create a dummy object
        const cmd = resp.data;
        cmd.output = resp.message;
        // Update
        selectedCmd.executed[key] = cmd;
        selectedCmd.working = cmd;
        if (selectedCmd.working.timeout === 600) {
          delete selectedCmd.working.timeout;
        }
      } else {
        selectedCmd.executed[key] = null;
        selectedCmd.working = {
          args: {},
        };
      }
      // Force an update
      this.scales = Object.assign({}, this.scales);
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

    async pollCommands() {
      if (this.polling) {
        return;
      }
      this.polling = true;

      // Build array of commands to query
      const cmds = [];
      Object.entries(this.scales).forEach(([scale, { commands }]) => {
        Object.entries(commands).forEach(([command, { executed }]) => {
          Object.values(executed).forEach(({ args }) => {
            cmds.push({
              scale,
              command,
              args,
            });
          });
        });
      });

      let shouldPoll = false;

      // Only query if we have things to query
      if (cmds.length > 0) {
        // XXX: We can't query using the above cause we need a way to do this without a body!
        const resp = await getCommands({ noOutput: true, SHA256Digest: this.sha256_digest });
        if (resp.status === 'success') {
          const { commands } = resp.data;
          commands.forEach((cmd) => {
            // We could have legacy scales in the commands db so we need to ignore those
            // TODO: Won't be needed once the XXX is addressed
            if (Object.keys(this.scales).indexOf(cmd.scale) !== -1) {
              // Do we still need to poll?
              if (typeof cmd.end_time === 'undefined') {
                shouldPoll = true;
              }
              // Get command object for updating
              const command = this.scales[cmd.scale].commands[cmd.command];
              // Get the key for executed
              const key = JSON.stringify(cmd.args);
              // Previous status
              // const { status } = command.executed[key];

              // Is this the selected command that needs updating?
              const selected = this.selected.split(':');
              if (cmd.scale === selected[0] &&
                  cmd.command === selected[1] &&
                  key === command.selected &&
                  !this.isPending(cmd) &&
                  !this.isRunning(cmd)) {
                this.getSelectedCommand();
              } else {
                // Update the command
                command.executed[key] = cmd;
              }
            }
          });
        }
        // Force an update
        this.scales = Object.assign({}, this.scales);
      }

      this.polling = false;
      if (shouldPoll) {
        setTimeout(() => { this.pollCommands(); }, 5000);
      }
    },

    runCommand(scale, command) {
      // Get the selected command
      const selectedCmd = this.scales[scale].commands[command];
      let args = {};
      let timeout = 600;
      if (typeof selectedCmd.working.args !== 'undefined') {
        ({ args } = selectedCmd.working);
      }
      if (typeof selectedCmd.working.timeout !== 'undefined') {
        ({ timeout } = selectedCmd.working);
      }

      // Queue it and leave the work to poll
      postCommand(
        this.sha256_digest,
        scale,
        command, // TODO:
        { args, timeout },
      ).then((resp) => {
        const key = JSON.stringify(args);
        if (resp.status === 'success') {
          selectedCmd.executed[key] = resp.data.command;
          if (this.activeCommand === selectedCmd) {
            selectedCmd.selected = key;
          }
          this.pollCommands();
        } else {
          // Create a dummy object
          const cmd = resp.data;
          cmd.format = 'json';
          if (typeof resp.message.args === 'undefined') {
            cmd.output = resp.message;
          }
          // Update
          // selectedCmd.executed[key] = cmd;
          selectedCmd.working = cmd;
          if (typeof resp.message.args !== 'undefined') {
            selectedCmd.working.invalid = Object.keys(resp.message.args);
            if (this.activeCommand === selectedCmd) {
              this.showArguments = true;
            }
          }
          if (selectedCmd.working.timeout === 600) {
            delete selectedCmd.working.timeout;
          }
          if (this.activeCommand === selectedCmd) {
            selectedCmd.selected = key;
          }
          // Force update
          this.scales = Object.assign({}, this.scales);
        }
      });
    },

    renderArguments(args) {
      const params = [];
      Object.entries(args).forEach(([k, v]) => {
        params.push(`${toCaps(k, { delimiter: '_' })}: ${v}`);
      });
      if (params.length > 0) {
        return params.join(', ');
      }
      return 'Defaults';
    },

    sortExecuted(executed) {
      const ordered = {};
      Object.entries(executed).sort((a, b) => {
        // Empty first
        const x = Object.values(a[1].args);
        const y = Object.values(b[1].args);
        if (x.length === 0) {
          return -1;
        }
        if (y.length === 0) {
          return 1;
        }
        let i = 0;
        const max = x.length > y.length ? x.length : y.length;
        while (i < max) {
          if (x[i] < y[i]) {
            return -1;
          }
          if (x[i] > y[i]) {
            return 1;
          }
          i += 1;
        }
        return 0;
      }).forEach(([k, v]) => {
        ordered[k] = v;
      });
      return ordered;
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
            executed: {},
            selected: null, // Key to entry in executed
            working: {
              args: {},
            }, // The working copy
          };
        });
        scales[scale] = {
          active: false,
          commands,
        };
      });
      // Load the executed into the above
      const resp = await getCommands({ noOutput: true, SHA256Digest: this.sha256_digest });
      if (resp.status === 'success') {
        const cmds = resp.data.commands;
        cmds.forEach((cmd) => {
          // We could have legacy scales in the commands db so we need to ignore those
          if (Object.keys(scales).indexOf(cmd.scale) !== -1) {
            // Activate the scale
            scales[cmd.scale].active = true;

            // Use args as the key and store them in executed
            const args = JSON.stringify(cmd.args);
            scales[cmd.scale].commands[cmd.command].executed[args] = cmd;

            // First command we get for a scale:command is the most recent execution
            if (!scales[cmd.scale].commands[cmd.command].selected) {
              scales[cmd.scale].commands[cmd.command].selected = args;
            }
          }
        });
      }

      this.scales = Object.assign({}, scales);
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
</style>
