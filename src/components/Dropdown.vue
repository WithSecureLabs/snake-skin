<template>
  <div v-click-away="hideDropdown" class="dropdown" v-bind:class="{ 'is-active': isActive }">
    <div class="dropdown-trigger">
      <button class="button" v-on:click="toggleActive" aria-haspopup="true" aria-controls="dropdown-menu">
        <span>{{ name }}</span>
        <span class="icon is-small">
          <icon name="chevron-down" class="fa" aria-hidden="true"></icon>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <div v-for="item in items" class="dropdown-item">
          <button v-if="item_key" class="button is-white is-small" v-on:click="run(item)">{{ item[item_key] }}</button>
          <button v-else class="button is-white is-small" v-on:click="run(item)">{{ item }}</button>
        </div>
        <button v-if="(item_key && Object.keys(items).length === 0) || (items.length === 0)" class="button is-white is-small" disabled="disabled">None</button>
      </div>
    </div>
  </div>
</template>


<script>
import 'vue-awesome/icons/chevron-down'
import Icon from 'vue-awesome/components/Icon'

export default {
  name: 'dropdown',
  props: [
    'name',
    'items',
    'item_key',
    'onclick',
    'update_name'
  ],
  components: {
    Icon
  },

  data () {
    return {
      isActive: false
    }
  },

  directives: {
    'click-away': {
      bind (el, binding, vnode) {
        el.event = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event)
          }
        }
        el.addEventListener('click', 'click-away'.stopProp)
        document.body.addEventListener('click', el.event)
      },

      unbind (el, binding, vnode) {
        el.removeEventListener('click', 'click-away'.stopProp)
        document.body.removeEventListener('click', el.event)
      },

      stopProp (event) {
        event.stopPropagation()
      }
    }
  },

  methods: {
    run: function (arg) {
      this.onclick(arg)
      this.isActive = false
    },

    hideDropdown: function () {
      this.isActive = false
    },

    toggleActive: function () {
      this.isActive = !this.isActive
    }
  }
}
</script>

<style lang="sass" scoped>
.dropdown-menu
  max-height: 50vh
  .dropdown-content
    max-height: 50vh
    overflow: auto
    div
      button
        justify-content: left
        width: 100%

.fa
  height: 10px
</style>
