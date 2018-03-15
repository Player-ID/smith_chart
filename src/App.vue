<template>
  <Chart
    :cursor-options="cursorOptions"
    :cursors="cursors"
    @dragMove="updateData"
  />
</template>

<script>
import Chart from './components/Chart'

import * as d3 from 'd3'
import { CENTER } from './js/chartConfig'

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

      var cursor = {}
      cursor.i = this.cursors.length + 1
      cursor.resistance = 1
      cursor.reactance = 0
      cursor.gamma = { r: 0, phi: 0 }
      cursor.swr = 0
      cursor.x = CENTER
      cursor.y = CENTER

      this.cursors.push(cursor)
    },
    updateData (event) {
      console.log(event)
      this.cursors[event.i - 1].x = CENTER + event.x
      this.cursors[event.i - 1].y = CENTER - event.y
    }
  }
}
</script>

<style>
</style>
