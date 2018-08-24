<template>
  <div id="analysis" class="analysis">
    <div class="sidebar">
      <h2 class="menu-label">Active</h2>
        <ul class="menu-list">
      <b-collapse :open="true" class="menu-section" v-for="(v, k) in sorted(active)" :key=k>
        <a slot="trigger" class="menu-label">{{ k }} </a>
        <ul class="menu-list">
          <li>
            <a v-for="item in v" :key=item>
              {{ item.command }}
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
    <div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Analysis',
  props: {
    commands: {
      default: () => {},
      type: Object,
    },
  },
  data: () => ({
    active: {},
    inactive: {},
  }),

  methods: {
    makeActive(scale) {
      this.$set(this.active, scale, this.inactive[scale]);
      delete this.inactive[scale];
    },

    sorted(unordered) {
      const ordered = {};
      Object.keys(unordered).sort().forEach((key) => {
        ordered[key] = unordered[key];
      });
      return ordered;
    },
  },

  watch: {
    commands() {
      // Put in inactive unless in active
      Object.entries(this.commands).forEach(([k, v]) => {
        if (Object.keys(this.active).indexOf(k) === -1) {
          this.$set(this.inactive, k, v);
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
h2.menu-label {
  color: black;
}

.menu-list {
  a {
    font-size: 0.8rem;
  }
}

.sidebar {
  border-right: 1px solid #999;
  height: 78vh;
  overflow: auto;
  width: 200px;
}
</style>
