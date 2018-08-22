<template>
  <aside id="sidebar" class="sidebar has-background-dark">
    <div v-for="(v, k) in sidebar" :key=k>
      <p class="menu-label">{{ k }} </p>
      <ul class="menu-list">
        <li>
        <router-link tag='a'
                     v-for="item in v"
                     :key=item
                     :to='{name:item.toLowerCase()}'
                     class='has-text-light'
        >
          {{ item }}
        </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
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

  methods: {
  },
};
</script>

<style scoped lang="scss">

#sidebar {
  bottom: 0;
  left: 0;
  padding: 1.5rem;
  position: fixed;
  text-align: left;
  top: 52px;
  width: 200px;
}
</style>
