import {API} from '@/config/config'

function state () { // We allow multiple stores so this must be a function!
  return {
    file_type: '', // File type for the store
    files: [], // Files in the store
    errors: [],
    running: false,

    // TEMP
    currentPage: 1,
    rows: 10
  }
}

const getters = {
  // TEMP
  storePageData: state => {
    var index = (state.currentPage - 1) * state.rows
    return state.files.slice(index, index + state.rows)
  },

  storePages: state => {
    if (state.files.length > 0) {
      return Math.ceil(state.files.length / state.rows)
    }
    return 0
  }
}

const mutations = {
  setStore (state, fileType) {
    if (fileType !== '') {
      state.file_type = fileType
    } else {
      state.file_type = ''
    }
    state.files = []
    state.errors = []
    state.running = false

    // TEMP
    state.currentPage = 1
    state.rows = 10
  },

  setFiles (state, files) {
    state.files = files
  },

  setStoreRunning (state, value) {
    state.running = value
  },

  pushError (state, e) {
    state.errors.push(e)
  },

  // Temp
  setStoreCurrentPage (state, page) {
    var newPage = page
    if (page < 1) {
      newPage = 1
    } else if (page > Math.ceil(state.files.length / state.rows)) {
      newPage = Math.ceil(state.files.length / state.rows)
    }
    state.currentPage = newPage
  },

  setStoreRows (state, rows) {
    state.rows = rows
  }
}

const actions = {
  initStore (context, fileType) {
    context.commit('setStore', fileType)
  },

  getFiles (context) {
    context.commit('setStoreRunning', true)
    var url = 'store'
    if (context.state.file_type !== '') {
      url += '?file_type=' + context.state.file_type
    }
    API.get(url)
      .then(response => {
        context.commit('setFiles', response.data['data']['samples'])
        context.commit('setStoreRunning', false)
      })
      .catch(e => {
        state.errors.push(e)
        context.commit('setStoreRunning', false)
      })
  },

  getFilteredFiles (context, filter) {
    context.commit('setStoreRunning', true)
    var url = 'store?' + filter
    if (context.state.file_type !== '') {
      url += '&file_type=' + context.state.file_type
    }
    API.get(url)
      .then(response => {
        context.commit('setFiles', response.data['data']['samples'])
        context.commit('setStoreRunning', false)
      })
      .catch(e => {
        context.commit('pushError', e)
        context.commit('setStoreRunning', false)
      })
  },

  getRecentFiles (context) {
    context.commit('setStoreRunning', true)
    var url = 'store?limit=10&sort=timestamp'
    if (context.state.file_type !== '') {
      url += '&file_type=' + context.state.file_type
    }
    API.get(url)
      .then(response => {
        context.commit('setFiles', response.data['data']['samples'])
        context.commit('setStoreRunning', false)
      })
      .catch(e => {
        context.commit('pushError', e)
        context.commit('setStoreRunning', false)
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
