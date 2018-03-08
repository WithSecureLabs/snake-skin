<template>
  <section id="app">
    <app-sidebar></app-sidebar>
    <app-navbar></app-navbar>
    <div class="wrapper">
      <router-view class="main-content"></router-view>
    </div>
  </section>
</template>


<script>
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
export default {
  name: 'app',
  components: {
    'app-navbar': Navbar,
    'app-sidebar': Sidebar
  }
}
</script>


<style lang="sass">
@import "../node_modules/bulma/sass/utilities/initial-variables.sass"
@import './styles/settings.sass'
@import '../node_modules/bulma/sass/utilities/_all.sass'
@import '../node_modules/bulma/sass/base/_all.sass'
@import '../node_modules/bulma/sass/components/_all.sass'
@import '../node_modules/bulma/sass/elements/_all.sass'
@import '../node_modules/highlightjs/styles/tomorrow.css'
@import './styles/markdown.sass'

body
  background-color: $white

html
  overflow: hidden

pre
  background-color: $white

table
  @extend .table
  background-color: $white
  color: $darkest
  margin-bottom: 1.5rem
  width: 100%
  thead
    th
      min-width: 10em
      word-break: break-all;
  tbody
    td
      min-width: 10em
    td:first-child
      min-width: 10em
      word-break: break-all;
  a
    display: block

#app
  display: flex
  height: 100vh

.auto
  flex: 1

.breadcrumb
  height: 62px
  left: 10rem
  position: fixed
  width: calc(100% * 1 - 10rem)
  z-index: 100

.collapse-item .card-content-box
  overflow: auto

.hljs
  background: $white

.main-content
  min-width: 600px

.sidebar
  height: 100%
  left: 0
  position: fixed
  width: 10rem
  z-index: 100

.wrapper
  height: calc(100% * 1 - 62px)
  padding: 0.5rem
  margin-left: 10rem
  margin-top: 62px
  overflow: auto
  width: calc(100% * 1 - 10rem)
</style>
