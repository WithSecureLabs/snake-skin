<template>
  <div class="scales">

    <div class="tabs">
      <ul>
        <li v-for="name in scaleNames()" :class="{'router-link-active': isActive('/scales/'+name)}">
          <router-link :to="{path: '/scales/'+name}">{{ name }}</router-link>
        </li>
      </ul>
    </div>

    <router-view></router-view>

  </div>
</template>


<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'scales',
  components: {

  },

  computed: {
    ...mapGetters({
      scaleNames: 'scales/scaleNames'
    })
  },

  created () {
    this.initScalesStore()
  },

  methods: {
    ...mapActions({
      initScalesStore: 'scales/initScalesStore'
    }),

    isActive (path) {
      return this.$route.path === path
    }
  },

  watch: {

  }
}
</script>


<style lang="sass" scoped>
@import '../styles/settings.sass'

ul > li.router-link-active > a
  border-bottom-color: $blue
  border-bottom-style: solid
  border-bottom-width: 1px
  color: $blue
  margin-bottom: -1px

</style>
