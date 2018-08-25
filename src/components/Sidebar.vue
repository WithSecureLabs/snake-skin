<template>
  <aside id="sidebar" class="sidebar has-background-dark">
    <div class="menu-section" v-for="(v, k) in sidebar" :key=k>
      <p class="menu-label">{{ k }} </p>
      <ul class="menu-list">
        <li>
        <router-link tag='a'
                     v-for="item in v"
                     :key=item
                     :to='{name:item.toLowerCase()}'
                     :class="{'is-active': isActive(item)}"
                     class='has-text-light'
        >
          {{ item }}
        </router-link>
        </li>
      </ul>
    </div>
    <span class="version">Version {{ version }}</span>
  </aside>
</template>

<script>
import { VERSION } from '@/settings';

export default {
  name: 'Sidebar',
  data: () => ({
    sidebar: {
      General: [
        'Dashboard',
      ],
      Store: [
        'Files',
        'Memories',
      ],
    },
  }),

  computed: {
    version() {
      return VERSION;
    },
  },

  methods: {
    isActive(path) {
      // Use to match things like file to files, etc
      if (path === 'Files') {
        return this.$route.path.split('/')[1] === 'file';
      }
      if (path === 'Memories') {
        return this.$route.path.split('/')[1] === 'memory';
      }

      return false;
    },
  },
};
</script>

<style scoped lang="scss">
#sidebar {
  bottom: 0;
  left: 0;
  padding: 0.5rem;
  position: fixed;
  text-align: left;
  top: 52px;
  width: 200px;
}

a {
  outline: 0;
}

.menu-list a:hover {
  background-color: hsl(0, 0%, 14%);
}

.menu-section:not(:last-child) {
  padding-bottom: 0.5rem;
}

.version {
  color: white;
  position: fixed;
  bottom: 1rem;
  left: 3.5rem;
}
</style>
