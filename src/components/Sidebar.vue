<template>
  <aside class="sidebar">
    <section class="logo">
        <img src="../assets/logo.svg"></img>
    </section>
    <ul>
      <li :class="{'router-link-active': isActive('dashboard')}">
        <router-link to="/dashboard">
          <span class="name">Dashboard</span>
        </router-link>
      </li>
      <li :class="{'router-link-active': isActive('file')}">
        <router-link to="/files">
          <span class="name">Files</span>
        </router-link>
      </li>
      <li :class="{'router-link-active': isActive('memory')}">
        <router-link to="/memories">
          <span class="name">Memories</span>
        </router-link>
      </li>
      <!--
        <li :class="{'router-link-active': isActive('scale')}">
        <router-link to="/scales">
          <span class="name">Scales</span>
        </router-link>
      </li>
      -->
    </ul>
    <div class="version">
      <p>Version {{version}}</p>
    </div>
  </aside>
</template>


<script>
import {VERSION} from '../config/config'

export default {
  name: 'app-sidebar',
  data: () => ({
    version: VERSION
  }),

  methods: {
    isActive (path) {
      return this.$route.path.split('/')[1] === path
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

a, h1, h2
  color: $white

h1, h2
  display: table-cell

.logo
  display: inline-block
  height: 62px
  margin: auto
  padding: .1em 1em
  img
    height: 54px
    padding-top: 6px
    padding-bottom: 6px
    margin: auto

.router-link-active
  background-color: $blue

.sidebar
  background-color: $black
  min-height: 100vh
  padding-right: 0px

.sidebar a
  display: block
  height: 50px
  line-height: 50px
  padding-left: 20px
  text-align: left
  text-decoration: none

.version
  bottom: 0
  height: 40px
  position: absolute
  width: 10em
  p
    text-align: center
    width: 100%
</style>
