<template>
  <Slideout
    :toggle-selectors="['.toggle-button']"
    panel="panel"
    menu="menu"
    side="right"
  >
    <TabView slot="menu">
      <button @click="addCursor">Add Cursor</button>
      <ControlCursor
        v-for="(id, index) in activeCursors"
        :key="index"
        :cursor-id="id"
      />
    </TabView>
    <div slot="panel">
      <div>
        <button class="toggle-button">☰</button>
      </div>
      <SmithChart/>
    </div>
  </Slideout>
</template>

<script>
import Slideout from './components/Slideout'
import TabView from './components/TabView'
import ControlCursor from './components/ControlCursor'
import SmithChart from './components/SmithChart'

import { mapState } from 'vuex'

export default {
  name: 'App',
  components: { Slideout, TabView, ControlCursor, SmithChart },
  computed: {
    ...mapState({
      activeCursors: state => state.activeCursors
    })
  },
  methods: {
    addCursor () {
      this.$store.commit('addCursor')
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
}

.toggle-button {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
