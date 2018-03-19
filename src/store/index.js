import Vue from 'vue'
import Vuex from 'vuex'

const prod = process.env.NODE_ENV === 'production'
Vue.config.productionTip = prod

Vue.use(Vuex)

export default new Vuex.Store({
  strict: !prod,
  state: {},
  mutations: {}
})
