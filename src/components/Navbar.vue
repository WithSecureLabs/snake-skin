<template>
  <nav id="navbar" class="level" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="#">
        <img src="@/assets/logo.svg">
      </a>
    </div>
    <div class="level-right">
        <div class="level-item">
          <search></search>
        </div>
        <div class="level-item">
          <a class="button is-primary">Upload</a>
        </div>
    </div>
  </nav>
</template>

<script>
import Search from '@/components/search/Search.vue';

export default {
  name: 'Navbar',
  components: {
    search: Search,
  },
  data: () => ({
    search: '',
  }),
};
</script>

<style scoped lang="scss">
#navbar {
  background-color: black;
  left: 0;
  right: 0;
  position: fixed;
  top: 0;
}

.level-item {
  div {
    padding-right: 0;
  }
}

.level-right {
  margin-right: 1rem;
}
</style>
