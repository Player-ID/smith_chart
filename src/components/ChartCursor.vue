<template>
  <g :id="groupId">
    <circle
      :cx="resistance.cx"
      :cy="resistance.cy"
      :r="resistance.r"
      :visibility="resistance.visibility"
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
      :visibility="!reactance.arcVisibility"
      :stroke="color"
      class="reactance-line"
      stroke-width="3"
    />
    <circle
      :cx="reactance.cx"
      :cy="reactance.cy"
      :r="reactance.r"
      :visibility="reactance.arcVisibility"
      :stroke="color"
      class="reactance-arc"
      stroke-width="3"
      fill="none"
      clip-path="url(#boundary-path)"
    />
    <line
      :x1="electricLength.x1"
      :y1="electricLength.y1"
      :x2="electricLength.x2"
      :y2="electricLength.y2"
      :visibility="electricLength.visibility"
      :stroke="color"
      class="electric-length"
      stroke-width="3"
    />
    <circle
      :cx="cursor.x"
      :cy="cursor.y"
      :fill="color"
      class="marker"
      r="5"
    />
  </g>
</template>

<script>
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
      displayElectricLengthThreshold: 0.01,
      displayResistanceThreshold: 1000,
      realAxis: {
        x1: CENTER - UNIT_RADIUS,
        y1: CENTER,
        x2: CENTER + UNIT_RADIUS,
        y2: CENTER
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
    resistance () {
      let circle = this.calculateResistanceCircle(this.cursor.resistance)
      circle.visibility = circle.value < this.displayResistanceThreshold ? 'visible' : 'hidden'
      return circle
    },
    reactance () {
      let arc = this.calculateReactanceCircle(this.cursor.reactance)
      arc.arcVisibility = 'visible'
      if (arc.value === 0) {
        arc.cy = 0
        arc.r = 0
        arc.arcVisibility = 'hidden'
      }
      return arc
    },
    electricLength () {
      const visibility = this.cursor.gamma.r > this.displayElectricLengthThreshold ? 'visible' : 'hidden'
      return {
        x1: CENTER,
        y1: CENTER,
        x2: CENTER + OUTER_RADIUS * Math.cos(this.cursor.gamma.phi),
        y2: CENTER - OUTER_RADIUS * Math.sin(this.cursor.gamma.phi),
        visibility: visibility
      }
    }
  },
  methods: {
    calculateResistanceCircle (value) {
      if (value < 0) {
        window.alert('Resistance can\'t be negative!')
      } else if (value === Infinity) {
        return {
          value: value,
          cx: CENTER + UNIT_RADIUS,
          cy: CENTER,
          r: 1
        }
      }

      return {
        value: value,
        cx: CENTER + UNIT_RADIUS * value / (value + 1),
        cy: CENTER,
        r: Math.abs(UNIT_RADIUS / (value + 1))
      }
    },
    calculateReactanceCircle (value) {
      if (Math.abs(value) === Infinity) {
        return {
          value: value,
          cx: CENTER + UNIT_RADIUS,
          cy: CENTER,
          r: 1
        }
      }

      return {
        value: value,
        cx: CENTER + UNIT_RADIUS,
        cy: CENTER - UNIT_RADIUS / value,
        r: Math.abs(UNIT_RADIUS / value)
      }
    }
  }
}
</script>

<style scoped>
</style>
