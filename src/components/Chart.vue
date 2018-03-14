<template>
  <div id="chart-area"/>
</template>

<script>
import * as d3 from 'd3'
import * as math from 'mathjs'
import * as calc from '../js/calculations.js'
import { WIDTH, CENTER, UNIT_RADIUS, OUTER_RADIUS } from '../js/constants.js'
import smithChartSvg from '../assets/smith_chart.svg'

export default {
  name: 'Chart',
  props: {
    cursors: {
      type: Array,
      validator: data => {
        return true
      },
      default () {
        return []
      }
    }
  },
  data: () => {
    return {
      maxCursors: 10,
      colorScale: d3.schemeCategory10,
      dragRadiusThreshold: 20,
      cursorWrapper: null
    }
  },
  computed: {
    colorInterpolator () {
      return d3.scaleOrdinal().range(this.colorScale)
    },
    data () {
      return this.cursors
    }
  },
  watch: {
    cursors () {
      this.updateCursors()
    }
  },
  mounted () {
    this.initialize()
  },
  methods: {
    initialize () {
      const chart = d3.select('#chart-area')
        .append('svg')
        .attr('height', WIDTH)
        .attr('width', WIDTH)
        .attr('viewBox', '0 0 ' + WIDTH + ' ' + WIDTH)
        .call(d3.drag()
          .subject(this.dragSubject)
          .on('start', this.dragStarted)
          .on('drag', this.dragged)
        )

      chart.append('image')
        .attr('id', 'smith-chart-image')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', WIDTH)
        .attr('height', WIDTH)
        .attr('xlink:href', smithChartSvg)

      chart.append('rect')
        .attr('id', 'image-blocker')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', WIDTH)
        .attr('height', WIDTH)
        .attr('opacity', '0')

      let chartBounds = calc.calculateResistanceCircle(0)
      chart.append('defs')
        .append('clipPath')
        .attr('id', 'boundary-clip')
        .append('circle')
        .attr('cx', chartBounds.cx)
        .attr('cy', chartBounds.cy)
        .attr('r', chartBounds.r)

      this.cursorWrapper = chart.append('g')
        .attr('id', 'cursors')
    },
    updateCursors () {
      console.log(this)
      console.log(this.cursors)
      console.log(this.data)
      this.cursorWrapper.selectAll('g')
        .data(this.cursors)
        .enter().append('g')
      // // Data join
      // const cursorGroup = this.cursorWrapper.selectAll('g')
      //   .data(this.cursors)

      // // Enter
      // const cursorGroupEnter = cursorGroup.enter().append('g')
      // cursorGroupEnter.append('circle')
      //   .attr('class', 'resistance-circle')
      //   .attr('stroke-width', 3)
      //   .attr('fill', 'none')
      // cursorGroupEnter.append('line')
      //   .attr('class', 'reactance-line')
      //   .attr('x1', CENTER - UNIT_RADIUS)
      //   .attr('y1', CENTER)
      //   .attr('x2', CENTER + UNIT_RADIUS)
      //   .attr('y2', CENTER)
      //   .attr('stroke-width', 3)
      // cursorGroupEnter.append('circle')
      //   .attr('class', 'reactance-arc')
      //   .attr('stroke-width', 3)
      //   .attr('fill', 'none')
      //   .attr('clip-path', 'url(#boundary-clip)')
      // cursorGroupEnter.append('line')
      //   .attr('class', 'electric-length')
      //   .attr('x1', CENTER)
      //   .attr('y1', CENTER)
      //   .attr('stroke-width', 3)
      // cursorGroupEnter.append('circle')
      //   .attr('class', 'marker')
      //   .attr('r', 5)

      // // Enter + Update
      // const cursorGroupUpdate = cursorGroup.merge(cursorGroupEnter)
      //   .attr('id', d => `cursor${d.i}`)
      // cursorGroupUpdate.select('.resistance-circle')
      //   .attr('cx', d => d.resistance.cx)
      //   .attr('cy', d => d.resistance.cy)
      //   .attr('r', d => d.resistance.r)
      //   .attr('stroke', d => this.colorInterpolator(d.i))
      // cursorGroupUpdate.select('.reactance-line')
      //   .attr('visibility', d => d.reactance.value === 0 ? 'visible' : 'hidden')
      //   .attr('stroke', d => this.colorInterpolator(d.i))
      // cursorGroupUpdate.select('.reactance-arc')
      //   .attr('cx', d => d.reactance.cx)
      //   .attr('cy', d => Math.abs(d.reactance.cy) === Infinity ? 0 : d.reactance.cy)
      //   .attr('r', d => d.reactance.r === Infinity ? 0 : d.reactance.r)
      //   .attr('visibility', d => d.reactance.value !== 0 ? 'visible' : 'hidden')
      //   .attr('stroke', d => this.colorInterpolator(d.i))
      // cursorGroupUpdate.select('.electric-length')
      //   .attr('x2', d => CENTER + OUTER_RADIUS * Math.cos(d.gamma.gamma.phi))
      //   .attr('y2', d => CENTER - OUTER_RADIUS * Math.sin(d.gamma.gamma.phi))
      //   .attr('stroke', d => this.colorInterpolator(d.i))
      // cursorGroupUpdate.select('.marker')
      //   .attr('cx', d => d.gamma.x)
      //   .attr('cy', d => d.gamma.y)
      //   .attr('fill', d => this.colorInterpolator(d.i))

      // // Exit
      // cursorGroup.exit().remove()
    },
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
