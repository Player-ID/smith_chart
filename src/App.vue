<template>
  <Chart
    :cursor-options="cursorOptions"
    :cursors="cursors"
  />
</template>

<script>
import Chart from './components/Chart'

import * as d3 from 'd3'
import * as calc from './js/calculations.js'

export default {
  name: 'App',
  components: {
    Chart
  },
  data: () => {
    return {
      isFull: false,
      cursorOptions: {
        maxCursors: 10,
        colorInterpolator: d3.scaleOrdinal().range(d3.schemeCategory10)
      },
      cursors: []
    }
  },
  mounted () {
    this.spawnCursor()
  },
  methods: {
    spawnCursor () {
      this.isFull = this.cursors.length + 1 > this.maxCursors
      if (this.isFull) return

      const defaultResistance = 1
      const defaultReactance = 0

      var cursor = {}
      cursor.i = this.cursors.length + 1
      cursor.resistance = calc.calculateResistanceCircle(defaultResistance)
      cursor.reactance = calc.calculateReactanceCircle(defaultReactance)
      cursor.gamma = calc.calculateGamma(defaultResistance, defaultReactance)

      this.cursors.push(cursor)
    }
  }
}
</script>

<style>
</style>
