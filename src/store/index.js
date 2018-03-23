import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import * as d3 from 'd3'

import {
  ADD_CURSOR,
  UPDATE_CURSOR,
  UPDATE_CURSOR_FIELD,
  UPDATE_CURSOR_FIELD_COMMANDS,
  REMOVE_CURSOR
} from './mutations.js'
import * as calc from '../js/calculations.js'

Vue.use(Vuex)

const prod = process.env.NODE_ENV === 'production'
Vue.config.productionTip = prod

const MAX_CURSORS = 9
const state = {
  cursorOptions: {
    colorInterpolator: d3.scaleOrdinal().range(d3.schemeCategory10),
    default: {
      resistance: 1,
      reactance: 0,
      gamma: {
        r: 0,
        phi: 0
      }
    }
  },
  cursorPool: _.range(1, MAX_CURSORS + 1),
  activeCursors: [],
  cursors: {}
}

const mutations = {
  [ADD_CURSOR] (state) {
    if (state.cursorPool.length === 0) return

    const id = state.cursorPool.shift()
    state.activeCursors.push(id)
    Vue.set(state.cursors, id, {
      id: id,
      ..._.cloneDeep(state.cursorOptions.default)
    })
  },
  [UPDATE_CURSOR] (state, payload) {
    state.cursors[payload.id] = payload
  },
  [UPDATE_CURSOR_FIELD] (state, payload) {
    let cursorToUpdate = state.cursors[payload.id]
    switch (payload.field) {
      case UPDATE_CURSOR_FIELD_COMMANDS.RESISTANCE: {
        const newGamma = calc.calculateGamma(payload.value, cursorToUpdate.reactance)
        cursorToUpdate.resistance = payload.value
        cursorToUpdate.gamma.r = newGamma.r
        cursorToUpdate.gamma.phi = newGamma.phi
        break
      }
      case UPDATE_CURSOR_FIELD_COMMANDS.REACTANCE: {
        const newGamma = calc.calculateGamma(cursorToUpdate.resistance, payload.value)
        cursorToUpdate.reactance = payload.value
        cursorToUpdate.gamma.r = newGamma.r
        cursorToUpdate.gamma.phi = newGamma.phi
        break
      }
      case UPDATE_CURSOR_FIELD_COMMANDS.GAMMA_MAG: {
        const newImpedance = calc.calculateImpedance(payload.value, cursorToUpdate.gamma.phi)
        cursorToUpdate.gamma.r = payload.value
        cursorToUpdate.resistance = newImpedance.resistance
        cursorToUpdate.reactance = newImpedance.reactance
        break
      }
      case UPDATE_CURSOR_FIELD_COMMANDS.GAMMA_ANG: {
        const newImpedance = calc.calculateImpedance(cursorToUpdate.gamma.r, payload.value)
        cursorToUpdate.gamma.phi = calc.reduceGammaAngle(payload.value)
        cursorToUpdate.resistance = newImpedance.resistance
        cursorToUpdate.reactance = newImpedance.reactance
        break
      }
    }
  },
  [REMOVE_CURSOR] (state, id) {
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
