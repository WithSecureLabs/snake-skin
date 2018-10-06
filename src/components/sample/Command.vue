<template>
  <li class="command">
    <a :class="{'is-active': isSelected}"
       @click="updateSelected(scale + ':' + command)"
    >
      <div class="level">
        <div class="level-left">
          - {{ command }}
        </div>
        <div class="level-right">
          <i v-if="isPending(data)"
             class="mdi mdi-dots-horizontal mdi-18px"
             aria-hidden="true"
          ></i>
          <i v-if="isRunning(data)"
             class="mdi mdi-loading mdi-18px spin"
             aria-hidden="true"
          ></i>
          <i v-if="isSuccess(data)"
             class="mdi mdi-check mdi-18px"
             aria-hidden="true"
          ></i>
          <i v-if="isFailed(data)"
             class="mdi mdi-close mdi-18px"
             aria-hidden="true"
          ></i>
          <div>
            <i v-tooltip="{
                content: data.info,
                placement: 'bottom',
                classes: ['tooltip'],
               }"
               class="mdi mdi-information mdi-18px" aria-hidden="true"
            ></i>
            <button :disabled="data.selected === JSON.stringify(data.working.args) && (isPending(data) || isRunning(data))"
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
      type: String,
    },
    data: {
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
      return `${this.scale}:${this.command}` === this.selected;
    },
  },

  methods: {
    isFailed(data) {
      if (!data.selected || !data.executed[data.selected]) {
        return false;
      }
      return data.executed[data.selected].status === 'failed';
    },
    isPending(data) {
      if (!data.selected || !data.executed[data.selected]) {
        return false;
      }
      return data.executed[data.selected].status === 'pending';
    },
    isRunning(data) {
      if (!data.selected || !data.executed[data.selected]) {
        return false;
      }
      return data.executed[data.selected].status === 'running';
    },
    isSuccess(data) {
      if (!data.selected || !data.executed[data.selected]) {
        return false;
      }
      return data.executed[data.selected].status === 'success';
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
  &:disabled {
    cursor: auto;
    opacity: 0.5;
  }
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
