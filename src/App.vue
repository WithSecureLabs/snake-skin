<template>
  <div id="app">
    <navbar></navbar>
    <main>
      <sidebar></sidebar>
      <div class="wrapper">
        <router-view/>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'App',
  components: {
    navbar: Navbar,
    sidebar: Sidebar,
  },
};
</script>

<style lang="scss">
@import "~bulma/sass/utilities/_all";

$primary: rgb(0, 159, 227);;
$primary-invert: findColorInvert($primary);

$colors: (
    "white": ($white, $black),
    "black": ($black, $white),
    "light": ($light, $light-invert),
    "dark": ($dark, $dark-invert),
    "primary": ($primary, $primary-invert),
    "info": ($info, $info-invert),
    "success": ($success, $success-invert),
    "warning": ($warning, $warning-invert),
    "danger": ($danger, $danger-invert),
);

$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

@import "~bulma";
@import "~buefy/src/scss/buefy";

main {
  padding-top: 52px;
  padding-left: 200px;
  text-align: left;
}

.wrapper {
  padding: 1rem;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
