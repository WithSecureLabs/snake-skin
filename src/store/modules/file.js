import {API, API_URL} from '@/config/config'
import router from '../../router'

// NOTE: This is the file database object and NOT the file_type: file. Yes this
// might be confusing!

const state = {
  sha256Digest: '', //

  file: {}, // The file object
  hex: '', // The hex output if supported
  note: {}, // The note object

  activeCommandIndex: -1, //
  activeCommandScale: '', //
  activeInterfaceScale: '', //
  commandScales: [], //
  pendingNote: {}, //

  errors: []
}

const getters = {
  downloadLink: state => {
    var sha = ''
    if (typeof state.file['sha256_digest'] !== 'undefined') {
      sha = state.file['sha256_digest']
    }
    return API_URL + 'download/' + sha
  },

  isNotePending: state => {
    if (Object.keys(state.pendingNote).length) {
      return true
    }
    return false
  }
}

const mutations = {
  setFileStore (state, sha256Digest) {
    state.sha256Digest = sha256Digest

    state.file = {}
    state.hex = ''
    state.note = {}

    state.activeCommandIndex = -1
    state.activeCommandScale = ''
    state.activeInterfaceScale = ''
    state.commandScales = []
    state.pendingNote = {}

    state.errors = []
  },

  setActiveCommandIndex (state, index) {
    state.activeCommandIndex = index
  },

  setActiveCommandScale (state, scale) {
    if (state.commandScales.indexOf(scale) === -1) {
      state.commandScales.push(scale)
    }
    state.commandScales.sort()
    state.activeCommandScale = scale
    state.activeCommandIndex = 0
  },

  setActiveInterfaceScale (state, scale) {
    state.activeInterfaceScale = scale
  },

  setCommands (state, commands) {
    // For now all we care about is active scales!
    for (var i in commands) {
      var c = commands[i]
      if (state.commandScales.indexOf(c.scale) === -1) {
        state.commandScales.push(c.scale)
      }
    }
    state.commandScales.sort()
  },

  setFile (state, file) {
    state.file = file
  },

  setFileHex (state, hex) {
    state.hex = hex
  },

  setNote (state, note) {
    state.note = note
    state.pendingNote = {}
  },

  setPendingNote (state, pendingNote) {
    state.pendingNote = pendingNote
  },

  setPendingNoteBody (state, body) {
    state.pendingNote['body'] = body
  },

  pushError (state, e) {
    state.errors.push(e)
  }
}

const actions = {
  initFileStore (context, sha256Digest) {
    context.commit('setFileStore', sha256Digest)
    context.dispatch('getFile')
  },

  getCommands (context) {
    var url = 'commands?sha256_digest=' + context.state.sha256Digest
    API.get(url)
      .then(response => {
        context.commit('setCommands', response.data['data']['commands'])
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  getFile (context) {
    API.get('store?filter[sha256_digest]=' + context.state.sha256Digest)
      .then(response => {
        context.commit('setFile', response.data['data']['store'][0])
        if (context.state.file.file_type === 'file') { // Additionally get the hex
          context.dispatch('getFileHex')
        }
        context.dispatch('getCommands')
        context.dispatch('getNote')
      })
      .catch(e => {
        context.commit('pushError', e)
        router.push('/error')
      })
  },

  getFileHex (context) {
    API.get('file/' + context.state.sha256Digest + '/hex')
      .then(response => {
        context.commit('setFileHex', response.data['data']['hex'])
      })
      .catch(e => {
        context.commit('pushError', e)
        router.push('/error')
      })
  },

  getNote (context) {
    API.get('note/' + context.state.sha256Digest)
      .then(response => {
        context.commit('setNote', response.data['data']['note'])
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  patchFile (context, data) {
    API.patch(context.state.file.file_type + '/' + context.state.sha256Digest, data)
      .then(response => {
        context.commit('setFile', response.data['data'][context.state.file.file_type])
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  patchNote (context) {
    API.patch('note/' + context.state.sha256Digest, context.state.pendingNote)
      .then(response => {
        context.commit('setNote', response.data['data']['note'])
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  postNote (context) {
    var data = context.state.pendingNote
    data['sha256_digest'] = context.state.sha256Digest
    API.post('note', data)
      .then(response => {
        context.commit('setNote', response.data['data']['note'])
      })
      .catch(e => {
        context.commit('pushError', e)
      })
  },

  saveNote (context, SHA256Digest) {
    if (Object.keys(context.state.note).length) {
      context.dispatch('patchNote', context.state.sha256Digest)
    } else {
      context.dispatch('postNote', context.state.sha256Digest)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
