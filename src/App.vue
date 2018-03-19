<template>
  <div>
    <button @click="spawnCursor">Add Cursor</button>
    <SmithChart
      v-model="cursors"
      :cursor-options="cursorOptions"
    />
  </div>
</template>

<script>
import SmithChart from './components/SmithChart'

import * as d3 from 'd3'

export default {
  name: 'App',
  components: {
    SmithChart
  },
  data: () => {
    return {
      cursorOptions: {
        maxCursors: 10,
        colorScale: d3.schemeCategory10
      },
      isFull: false,
      cursors: []
    }
  },
  mounted () {
    this.spawnCursor()
  },
  methods: {
    spawnCursor () {
      this.isFull = this.cursors.length + 1 > this.cursorOptions.maxCursors
      if (this.isFull) return

      var cursor = {}
      cursor.i = this.cursors.length + 1
      cursor.resistance = 1
      cursor.reactance = 0
      cursor.gamma = {
        r: 0,
        phi: 0
      }

      this.cursors.push(cursor)
    }
  }
}
</script>

<style>
</style>
