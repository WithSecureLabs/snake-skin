import Vue from 'vue'
import Vuex from 'vuex'
import file from './modules/file'
import scale from './modules/scale'
import scales from './modules/scales'
import store from './modules/store'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  // All modules are namespaced
  modules: {
    file,
    files: store,
    memories: store,
    scale,
    scales
  },
  strict: debug
})
