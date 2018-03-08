<template>
  <div class="files">

    <div class="tabs">
      <ul>
        <li :class="{'router-link-active': isActive('/'+file.file_type+'/'+sha256_digest)}">
          <router-link :to="{path: '/'+file.file_type+'/'+sha256_digest}">Details</router-link>
        </li>
        <li :class="{'router-link-active': isActive('/'+file.file_type+'/'+sha256_digest+'/notes')}">
          <router-link :to="{path: '/'+file.file_type+'/'+sha256_digest+'/notes'}">Notes</router-link>
        </li>
        <li :class="{'router-link-active': isActive('/'+file.file_type+'/'+sha256_digest+'/analysis')}">
          <router-link :to="{path: '/'+file.file_type+'/'+sha256_digest+'/analysis'}">Analysis</router-link>
        </li>
        <li :class="{'router-link-active': isActive('/'+file.file_type+'/'+sha256_digest+'/interfaces')}">
          <router-link :to="{path: '/'+file.file_type+'/'+sha256_digest+'/interfaces'}">Interfaces</router-link>
        </li>
      </ul>
      <div class="tabs-button">
        <a class="button is-primary is-outlined" :href="downloadHref">Download</a>
      </div>
    </div>

    <router-view></router-view>

  </div>
</template>


<script>
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import Analysis from '@/components/Analysis'
import Details from '@/components/Details'
import Notes from '@/components/Notes'

export default {
  name: 'file',
  props: ['sha256_digest'],
  components: {
    'analysis': Analysis,
    'detail': Details,
    'notes': Notes
  },

  computed: {
    ...mapGetters({
      downloadLink: 'file/downloadLink'
    }),
    ...mapState({
      file: state => state.file.file
    }),

    downloadHref () {
      return this.downloadLink
    }
  },

  created () {
  },

  mounted () {
    this.setScalesStore()
    this.initFileStore(this.sha256_digest)
  },

  methods: {
    ...mapActions({
      initScalesStore: 'scales/initScalesStore',
      initFileStore: 'file/initFileStore'
    }),

    ...mapMutations({
      setScalesStore: 'scales/setScalesStore'
    }),

    isActive (path) {
      return this.$route.path === path
    }
  },

  watch: {
    file: function (value) {
      if (typeof this.file.file_type === 'undefined') {
        return
      }
      this.initScalesStore(this.file.file_type)
    },

    sha256_digest: function (value) {
      this.initFileStore(this.sha256_digest)
      this.$store.dispatch('getFile', value)
    }
  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

h2
  color: $white

nav
  background-color: $dark
  display: flex
  margin-bottom: 1em
  margin-left: -1em
  margin-right: -1em
  margin-top: -1em

ul > li.router-link-active > a
  border-bottom-color: $blue
  border-bottom-style: solid
  border-bottom-width: 1px
  color: $blue
  margin-bottom: -1px

.tabs-button
  border-bottom-color: #dbdbdb
  border-bottom-style: solid
  border-bottom-width: 1px

</style>
