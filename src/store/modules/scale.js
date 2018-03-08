import {API} from '@/config/config'

const state = {
  commands: [],
  scale: {}, // The scale object
  errors: []
}

const getters = {
  name: state => {
    return state.scale.name
  }
}

const mutations = {
  setScaleStore (state) {
    state.commands = []
    state.scale = {}
    state.errors = []
  },

  setCommands (state, commands) {
    state.commands = commands
  },

  setScale (state, scale) {
    state.scale = scale
  },

  pushError (state, e) {
    state.errors.push(e)
  }
}

const actions = {
  initScaleStore (context, scale) {
    context.commit('setScaleStore')
    context.dispatch('getScale', scale)
  },

  getCommands (context, scale) {
    API.get('scale/' + scale + '/commands')
      .then(response => {
        context.commit('setCommands', response.data['data']['commands'])
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  getScale (context, scale) {
    var url = 'scale/' + scale
    API.get(url)
      .then(response => {
        var s = response.data['data']['scale']
        context.commit('setScale', s)
        if (s.components.indexOf('commands') !== -1) {
          context.dispatch('getCommands', scale)
        }
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
