<template>
  <div>
    <button @click="addCursor()">Add Cursor</button>
    <SmithChart/>
  </div>
</template>

<script>
import SmithChart from './components/SmithChart'

export default {
  name: 'App',
  components: {
    SmithChart
  },
  methods: {
    addCursor () {
      this.$store.commit('addCursor')
    }
  }
}
</script>

<style>
</style>
