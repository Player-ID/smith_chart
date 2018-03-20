<template>
  <Slideout
    :toggle-selectors="['.toggle-button']"
    panel="panel"
    menu="menu"
    side="right"
  >
    <div slot="menu">
      <button @click="addCursor()">Add Cursor</button>
    </div>
    <div slot="panel">
      <header>
        <button class="toggle-button">☰</button>
      </header>
      <SmithChart/>
    </div>
  </Slideout>
</template>

<script>
import Slideout from './components/Slideout'
import SmithChart from './components/SmithChart'

export default {
  name: 'App',
  components: { Slideout, SmithChart },
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
  float: right;
}
</style>
