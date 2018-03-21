import Vue from 'vue'
import Vuex from 'vuex'
import * as d3 from 'd3'

Vue.use(Vuex)

const prod = process.env.NODE_ENV === 'production'
Vue.config.productionTip = prod

const MAX_CURSORS = 9
const state = {
  cursorOptions: {
    colorInterpolator: d3.scaleOrdinal().range(d3.schemeCategory10)
  },
  cursorPool: Array.from(Array(MAX_CURSORS).keys(), (_, x) => x + 1),
  activeCursors: [],
  cursors: {}
}

const mutations = {
  addCursor (state) {
    if (state.cursorPool.length === 0) return

    const id = state.cursorPool.shift()
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
  },
  updateCursor (state, payload) {
    state.cursors[payload.id] = payload
  },
  removeCursor (state, id) {
    delete state.cursors[id]
    state.cursorPool.push(id)
    state.cursorPool.sort((a, b) => a - b)
    state.activeCursors = state.activeCursors.filter(value => value !== id)
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
