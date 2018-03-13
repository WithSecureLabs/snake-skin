<template>
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul class="breadcrumbs">
      <template v-for="(breadcrumb, index) in breadcrumbs">
        <template v-if="isLast(index)">
          <li class="is-active">
            <a :href="breadcrumb.path" aria-current="page">{{ breadcrumb.name }}</a>
          </li>
        </template>
        <template v-else>
          <li>
            <a :href="breadcrumb.path">{{ breadcrumb.name }}</a>
          </li>
        </template>
      </template>
    </ul>
    <div class="navbar-end" style="margin-top:auto; margin-bottom:auto">
      <div class="search navbar-item">
        <search></search>
      </div>
      <div class="navbar-item">
        <p class="control">
          <a class="button is-primary" href="#/upload">Upload</a>
        </p>
      </div>
    </div>
  </nav>
</template>


<script>
import {mapState} from 'vuex'
import Search from '@/components/Search'

export default {
  name: 'app-navbar',
  components: {
    'search': Search
  },

  data: () => ({
    searchText: ''
  }),

  computed: {
    ...mapState({
      file: state => state.file.file
    }),

    breadcrumbs: function () {
      var breadcrumbs = this.$route.path.split('/').splice(1)
      var path = '#'
      var b = []
      for (var i in breadcrumbs) {
        // Handle special cases
        var breadcrumb = breadcrumbs[i]
        if (breadcrumb === 'file') {
          breadcrumb = 'files'
          b.push({name: breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1), path: '#/files'})
          path += '/file'
        } else if (breadcrumb === 'memory') {
          breadcrumb = 'memories'
          b.push({name: breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1), path: '#/memories'})
          path += '/memory'
        } else {
          path += '/' + breadcrumb
          var fileType = ''
          if (this.file.sha256_digest === breadcrumb) {
            if (this.file.magic) {
              fileType = this.file.magic.split(' ')[0]
            }
            b.push({name: this.file.name + ' - ' + fileType, path: path})
          } else {
            b.push({name: breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1), path: path})
          }
        }
      }
      return b
    }
  },

  methods: {
    isLast: function (index) {
      if (index === (this.breadcrumbs.length - 1)) {
        return true
      }
      return false
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

.search
  display: none

.breadcrumb
  background-color: $dark
  color: $white
  display: flex
  flex-flow: row
  margin-bottom: 0
  overflow: visible
  padding-left: .5em

.breadcrumbs
  max-width: 65%
  width: 65%

.navbar-item
  padding-left: 0
  padding-right: 0.5em

.navbar-end
  width: 35%
  .navbar-item:first-child
    width: 100%

td > a
  justify-content: left

td > a:first-child
  word-wrap: break-word
  word-break: break-all
  white-space: normal

li
  max-width: 30em

li > a
  overflow: hidden
  text-overflow: ellipsis
  width: 100%

li > a
  color: $grey
  display: inline-block

li > a:hover
  color: $blue

li + li::before
  color: $grey

li.is-active > a
  color: $white

li.is-active::before
  color: $grey

@media screen and (min-width: 1000px)
  .search
    display: block
</style>
