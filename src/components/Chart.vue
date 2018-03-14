<template>
  <div id="chart-area">
    <svg
      :width="width"
      :height="width"
      :viewport="viewport"
    >
      <defs>
        <clipPath id="boundary-clip">
          <circle
            :cx="chartBounds.cx"
            :cy="chartBounds.cy"
            :r="chartBounds.r"
          />
        </clipPath>
      </defs>
      <image
        id="smith-chart-image"
        :width="width"
        :height="width"
        x="0"
        y="0"
        xlink:href="../assets/smith_chart.svg"
      />
      <rect
        id="image-blocker"
        :width="width"
        :height="width"
        x="0"
        y="0"
        opacity="0"
      />
      <g id="cursors">
        <ChartCursor
          v-for="cursor in cursors"
          :key="cursor.i"
          :cursor="cursor"
          :colorInterpolator="cursorOptions.colorInterpolator"
        />
      </g>
    </svg>
  </div>
</template>

<script>
import ChartCursor from './ChartCursor.vue'

import * as d3 from 'd3'
import * as math from 'mathjs'

import { WIDTH as SVG_WIDTH } from '../js/chartConfig.js'
import * as calc from '../js/calculations.js'

export default {
  name: 'Chart',
  components: {
    ChartCursor
  },
  props: {
    width: {
      type: Number,
      default: SVG_WIDTH
    },
    cursorOptions: {
      type: Object,
      default () {
        return {
          maxCursors: 10,
          colorInterpolator: d3.scaleOrdinal().range(d3.schemeCategory10)
        }
      }
    },
    cursors: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data: () => {
    return {
      dragRadiusThreshold: 20
    }
  },
  computed: {
    viewport () {
      return `0 0 ${SVG_WIDTH} ${SVG_WIDTH}`
    },
    chartBounds () {
      return calc.calculateResistanceCircle(0)
    }
  },
  methods: {
    dragSubject () {
      let subject
      let closestDistance2 = math.pow(this.dragRadiusThreshold, 2)

      this.cursors.forEach(function (cursor, i) {
        const dx = d3.event.x - cursor.gamma.x
        const dy = d3.event.y - cursor.gamma.y
        const distance2 = dx * dx + dy * dy
        if (distance2 < closestDistance2) {
          subject = cursor
          closestDistance2 = distance2
        }
      })

      return subject
    },
    dragStarted () {
      d3.select('#cursor' + d3.event.subject.i).raise()
    },
    dragged () {
      // const cursor = d3.event.subject

      // const x = d3.event.x - CENTER
      // const y = -(d3.event.y - CENTER)

      // const normX = Math.sign(x) *
      //   Math.min(Math.abs(x), UNIT_RADIUS) / UNIT_RADIUS
      // const normY = Math.sign(y) *
      //   Math.min(Math.abs(y), UNIT_RADIUS) / UNIT_RADIUS

      // const r = Math.sqrt(math.pow(normX, 2) + math.pow(normY, 2))
      // let phi
      // if (normX === 0) {
      //   phi = normY >= 0 ? Math.PI / 2 : -Math.PI / 2
      // } else if (normX > 0) {
      //   phi = Math.atan(normY / normX)
      // } else {
      //   phi = normY >= 0
      //     ? Math.PI + Math.atan(normY / normX)
      //     : -Math.PI + Math.atan(normY / normX)
      // }

      // const gamma = math.complex({ r: r, phi: phi })
      // const impedance = math.divide(math.add(1, gamma), math.subtract(1, gamma))

      // const resistance = math.re(impedance)
      // const reactance = math.im(impedance)
      // cursor.resistance = calc.calculateResistanceCircle(resistance < 0 ? 0 : resistance)
      // cursor.reactance = calc.calculateReactanceCircle(reactance)
      // cursor.gamma = {
      //   gamma: gamma,
      //   x: CENTER + UNIT_RADIUS * r * Math.cos(phi),
      //   y: CENTER - UNIT_RADIUS * r * Math.sin(phi)
      // }
    }
  }
}
</script>

<style scoped>
</style>
