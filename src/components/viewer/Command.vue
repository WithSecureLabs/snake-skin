<template>
  <li class="command">
    <a :class="{'is-active': isSelected}"
       @click="updateSelected(scale + ':' + command.name)"
    >
      <div class="level">
        <div class="level-left">
          - {{ command.name }}
        </div>
        <div class="level-right">
          <i v-if="isPending(command)"
             class="mdi mdi-dots-horizontal mdi-18px"
             aria-hidden="true"
          ></i>
          <i v-if="isRunning(command)"
             class="mdi mdi-loading mdi-18px spin"
             aria-hidden="true"
          ></i>
          <i v-if="isSuccess(command)"
             class="mdi mdi-check mdi-18px"
             aria-hidden="true"
          ></i>
          <i v-if="isFailed(command)"
             class="mdi mdi-close mdi-18px"
             aria-hidden="true"
          ></i>
          <div>
            <i v-tooltip="{
                content: command.info,
                placement: 'bottom',
                classes: ['tooltip'],
               }"
               class="mdi mdi-information mdi-18px" aria-hidden="true"
            ></i>
            <button :disabled="isPending(command) || isRunning(command)"
               @click="runCommand(scale, command)"
               class="icon-button"
            >
              <i class="mdi mdi-play-circle mdi-18px" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </a>
  </li>
</template>

<script>
export default {
  name: 'Command',
  props: {
    scale: {
      default: () => null,
      type: String,
    },
    command: {
      default: () => null,
      type: Object,
    },
    selected: {
      default: () => '',
      type: String,
    },
    runCommand: {
      default: () => null,
      type: Function,
    },
  },

  computed: {
    isSelected() {
      return `${this.scale}:${this.command.name}` === this.selected;
    },
  },

  methods: {
    isFailed(command) {
      if (!command || !command.command) {
        return false;
      }
      return command.command.status === 'failed';
    },
    isPending(command) {
      if (!command || !command.command) {
        return false;
      }
      return command.command.status === 'pending';
    },
    isRunning(command) {
      if (!command || !command.command) {
        return false;
      }
      return command.command.status === 'running';
    },
    isSuccess(command) {
      if (!command || !command.command) {
        return false;
      }
      return command.command.status === 'success';
    },
    updateSelected(value) {
      this.$emit('update:selected', value);
    },
  },
};
</script>

<style lang="scss">
.command {
  a {
    font-size: 0.75rem;
    padding-bottom: 0;
    padding-top: 0;
  }
}

.icon-button {
  background-color: transparent;
  border: none;
  color: inherit;
  cursor:pointer;
  padding: 0;
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
