<template>
  <g :id="groupId">
    <circle
      :cx="cursor.resistance.cx"
      :cy="cursor.resistance.cy"
      :r="cursor.resistance.r"
      :stroke="color"
      class="resistance-circle"
      stroke-width="3"
      fill="none"
    />
    <line
      :x1="realAxis.x1"
      :y1="realAxis.y1"
      :x2="realAxis.x2"
      :y2="realAxis.y2"
      :stroke="color"
      :visibility="reactanceLineVisibility"
      class="reactance-line"
      stroke-width="3"
    />
    <circle
      :cx="cursor.reactance.cx"
      :cy="reactanceArcCy"
      :r="reactanceArcR"
      :stroke="color"
      :visibility="reactanceArcVisibility"
      class="reactance-arc"
      stroke-width="3"
      fill="none"
      clip-path="url(#boundary-path)"
    />
    <line
      :x1="electricLengthStart.x1"
      :y1="electricLengthStart.y1"
      :x2="electricLengthEnd.x2"
      :y2="electricLengthEnd.y2"
      :stroke="color"
      class="electric-length"
      stroke-width="3"
    />
    <circle
      :cx="cursor.gamma.x"
      :cy="cursor.gamma.y"
      :fill="color"
      class="marker"
      r="5"
    />
  </g>
</template>

<script>
// import * as calc from '../js/calculations.js'
import { CENTER, UNIT_RADIUS, OUTER_RADIUS } from '../js/chartConfig'

export default {
  name: 'ChartCursor',
  props: {
    colorInterpolator: {
      type: Function,
      default () {
        return 'black'
      }
    },
    cursor: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      realAxis: {
        x1: CENTER - UNIT_RADIUS,
        y1: CENTER,
        x2: CENTER + UNIT_RADIUS,
        y2: CENTER
      },
      electricLengthStart: {
        x1: CENTER,
        y1: CENTER
      }
    }
  },
  computed: {
    groupId () {
      return `cursor-${this.cursor.i}`
    },
    color () {
      return this.colorInterpolator(this.cursor.i)
    },
    reactanceLineVisibilty () {
      return this.cursor.reactance.value === 0 ? 'visible' : 'hidden'
    },
    reactanceArcVisibility () {
      return this.cursor.reactance.value !== 0 ? 'visible' : 'hidden'
    },
    reactanceArcCy () {
      return Math.abs(this.cursor.reactance.cy) === Infinity
        ? 0
        : this.cursor.reactance.cy
    },
    reactanceArcR () {
      return Math.abs(this.cursor.reactance.r) === Infinity
        ? 0
        : this.cursor.reactance.r
    },
    electricLengthEnd () {
      const x2 = CENTER + OUTER_RADIUS * Math.cos(this.cursor.gamma.gamma.phi)
      const y2 = CENTER - OUTER_RADIUS * Math.sin(this.cursor.gamma.gamma.phi)

      return {
        x2: x2,
        y2: y2
      }
    }
  }
}
</script>

<style scoped>
</style>
