import {API} from '@/config/config'
import Vue from 'vue'

const state = {
  _commands: {}, //
  _scales: {},

  activeCommand: '', // The currently selected command
  activeScale: '', // The currently selected scale
  scales: {}, // The scales objects
  interfaces: {},
  uploads: {},
  errors: []
}

const getters = {
  commands: (state, getters) => (scaleName) => {
    var cmds = state._commands[scaleName]
    if (typeof cmds !== 'undefined') {
      return cmds
    }
    return []
  },

  upload: (state, getters) => (scaleName) => {
    var upld = state.uploads[scaleName]
    if (typeof upld !== 'undefined') {
      return upld
    }
    return {}
  },

  activeCommands: state => {
    if (typeof state._scales[state.activeScale] !== 'undefined') {
      return state._scales[state.activeScale]
    }
    return []
  },

  activeScales: state => {
    var keys = Object.keys(state._scales)
    if (keys.length === 0) {
      return []
    }
    return keys.sort()
  },

  scaleNames: (state, getters) => (component) => {
    var keys = []
    if (typeof component !== 'undefined') {
      if (component === 'commands') {
        keys = Object.keys(state._commands)
      } else if (component === 'interface') {
        keys = Object.keys(state.interfaces)
      } else if (component === 'upload') {
        keys = Object.keys(state.uploads)
      }
    } else {
      if (Object.keys(state.scales).length > 0) {
        keys = Object.keys(state.scales)
      }
    }
    return keys.sort()
  }
}

const mutations = {
  setScalesStore (state) {
    state._commands = {}
    state._scales = {}
    state.activeScale = ''
    state.activeCommand = ''
    state.interfaces = {}
    state.scales = {}
    state.uploads = {}
    state.errors = []
  },

  setActiveCommand (state, command) {
    state.activeCommand = command.command
  },

  setActiveScale (state, scale) {
    if (scale.components.indexOf('commands') !== -1) {
      Vue.set(state._scales, scale.name, scale)
      state.activeScale = scale.name
      return
    }
    state.activeScale = ''
    state.activeCommand = ''
  },

  setCommands (state, data) {
    Vue.set(state._commands, data.scale, data.commands)
  },

  setInterface (state, data) {
    Vue.set(state.interfaces, data.scale, data.interface)
  },

  setScale (state, scaleName) {
    if (typeof state._scales[scaleName] === 'undefined') {
      Vue.set(state._scales, scaleName, []) // We can set this to empty as it will populate once activated
    }
  },

  setScales (state, scales) {
    state._commands = {}
    state.interfaces = {}
    state.uploads = {}
    state.scales = {}
    for (var i in scales) {
      var s = scales[i]
      Vue.set(state.scales, s.name, s)
    }
  },

  setUpload (state, data) {
    Vue.set(state.uploads, data.scale, data.upload)
  },

  pushError (state, e) {
    state.errors.push(e)
  }
}

const actions = {
  initScalesStore (context, fileType) {
    context.commit('setScalesStore')
    context.dispatch('getScales', fileType)
  },

  activateCommand (context, command) {
    context.commit('setActiveCommand', command)
  },

  activateScale (context, scale) {
    context.commit('setActiveScale', scale)
  },

  getCommands (context, scale) {
    API.get('scale/' + scale + '/commands')
      .then(response => {
        var data = {
          'scale': scale,
          'commands': response.data['data']['commands']
        }
        context.commit('setCommands', data)
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  getInterface (context, scale) {
    API.get('scale/' + scale + '/interface')
      .then(response => {
        var data = {
          'scale': scale,
          'interface': response.data['data']['interface']
        }
        context.commit('setInterface', data)
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  getScales (context, fileType) {
    var url = 'scales'
    if (fileType !== '' && typeof fileType !== 'undefined') {
      url += '?file_type=' + fileType
    }
    API.get(url)
      .then(response => {
        var scales = response.data['data']['scales']
        context.commit('setScales', scales)
        for (var i in scales) {
          var scale = scales[i]
          if (scale.components.indexOf('commands') !== -1) {
            context.dispatch('getCommands', scale.name)
          }
          if (scale.components.indexOf('interface') !== -1) {
            context.dispatch('getInterface', scale.name)
          }
          if (scale.components.indexOf('upload') !== -1) {
            context.dispatch('getUpload', scale.name)
          }
        }
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  getUpload (context, scale) {
    API.get('scale/' + scale + '/upload')
      .then(response => {
        var data = {
          'scale': scale,
          'upload': response.data['data']['upload']
        }
        context.commit('setUpload', data)
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
