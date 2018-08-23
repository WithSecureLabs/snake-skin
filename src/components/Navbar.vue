<template>
  <nav id="navbar" class="navbar is-black" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="#">
        <img src="@/assets/logo.svg">
      </a>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <!-- navbar items -->
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <b-input v-model="search"></b-input>
        </div>
        <div class="navbar-item">
          <a class="button is-primary">Upload</a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data: () => ({
    search: '',
  }),
};
</script>

<style scoped lang="scss">
#navbar {
  left: 0;
  right: 0;
  position: fixed;
  top: 0;
}
</style>
