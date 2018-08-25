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
@import '~@mdi/font/css/materialdesignicons.css';

main {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  padding-top: 52px;
  padding-left: 200px;
  text-align: left;
}

.wrapper {
  height: 100%;
  overflow: auto;
  padding: 1rem;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/****/

.tooltip {
    .tooltip-inner {
      content: attr(data-label);
      padding: 0.35rem 0.75rem;
      border-radius: $radius-large;
      font-size: 0.85rem;
      font-weight: $weight-normal;
      box-shadow: 0px 1px 2px 1px rgba(0, 1, 0, 0.2);
      z-index: 888;
      max-width: 250px;
      background: $primary;
      color: $primary-invert;
    }
    .tooltip-arrow {
      border-color: $primary;
    }
}
</style>
