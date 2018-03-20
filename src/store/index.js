import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'

Vue.use(Vuex)

const prod = process.env.NODE_ENV === 'production'
Vue.config.productionTip = prod

const state = {
  cursorOptions: {
    maxCursors: 10,
    colorInterpolator: d3.scaleOrdinal().range(d3.schemeCategory10)
  },
  activeCursors: [1],
  cursorsFull: false,
  cursors: {
    1: {
      id: 1,
      resistance: 1,
      reactance: 0,
      gamma: {
        r: 0,
        phi: 0
      }
    }
  }
}

const mutations = {
  addCursor (state) {
    if (state.cursorsFull) return

    let id = state.activeCursors.length + 1
    state.activeCursors.push(id)
    Vue.set(state.cursors, id, {
      id: id,
      resistance: 1,
      reactance: 0,
      gamma: {
        r: 0,
        phi: 0
      }
    })

    state.cursorsFull = state.activeCursors.length >= state.cursorOptions.maxCursors
  },
  updateCursorData (state, payload) {
    Vue.set(state.cursors, payload.id, payload)
  }
}

const getters = {
  allCursors: state => {
    return state.activeCursors.map(id => state.cursors[id])
  }
}

export default new Vuex.Store({
  strict: !prod,
  state: state,
  mutations: mutations,
  getters: getters
})
