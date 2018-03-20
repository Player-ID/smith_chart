<template>
  <div id="chart-area"/>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as d3 from 'd3'
import math from 'mathjs'
import { WIDTH, CENTER, UNIT_RADIUS, OUTER_RADIUS } from '../js/chartDimensions.js'
import smithChartSvg from '../assets/smith_chart.svg'

export default {
  name: 'SmithChart',
  data: () => {
    return {
      dragRadiusThreshold: 20,
      cursorWrapper: null,
      cursorShapes: null
    }
  },
  computed: {
    ...mapState({
      colorInterpolator: state => state.cursorOptions.colorInterpolator
    }),
    ...mapGetters({
      cursors: 'allCursors'
    })
  },
  watch: {
    cursors () {
      this.updateCursorData()
      this.updateCursors()
    }
  },
  mounted () {
    this.initialize()
    this.updateCursorData()
    this.updateCursors()
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

      let chartBounds = this.calculateResistanceCircle(0)
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
    updateCursorData () {
      this.cursorShapes = this.cursors.map((cursor) => {
        return {
          i: cursor.id,
          x: CENTER + UNIT_RADIUS * cursor.gamma.r * Math.cos(cursor.gamma.phi),
          y: CENTER - UNIT_RADIUS * cursor.gamma.r * Math.sin(cursor.gamma.phi),
          resistance: this.calculateResistanceCircle(cursor.resistance),
          reactance: this.calculateReactanceCircle(cursor.reactance),
          electricLength: this.calculateElectricLength(cursor.gamma)
        }
      })
    },
    updateCursors () {
      // Data join
      const cursorGroup = this.cursorWrapper.selectAll('g')
        .data(this.cursorShapes)

      // Enter
      const cursorGroupEnter = cursorGroup.enter().append('g')
      cursorGroupEnter.append('circle')
        .attr('class', 'resistance-circle')
        .attr('stroke-width', 3)
        .attr('fill', 'none')
      cursorGroupEnter.append('path')
        .attr('class', 'reactance-arc')
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('clip-path', 'url(#boundary-clip)')
      cursorGroupEnter.append('line')
        .attr('class', 'electric-length')
        .attr('x1', CENTER)
        .attr('y1', CENTER)
        .attr('stroke-width', 3)
      cursorGroupEnter.append('circle')
        .attr('class', 'marker')
        .attr('r', 5)

      // Enter + Update
      const cursorGroupUpdate = cursorGroup.merge(cursorGroupEnter)
        .attr('id', d => `cursor${d.i}`)
      cursorGroupUpdate.select('.resistance-circle')
        .attr('cx', d => d.resistance.cx)
        .attr('cy', d => d.resistance.cy)
        .attr('r', d => d.resistance.r)
        .attr('visibility', d => d.reactance.visibility)
        .attr('stroke', d => this.colorInterpolator(d.i))
      cursorGroupUpdate.select('.reactance-arc')
        .attr('d', d => d.reactance.path)
        .attr('visibility', d => d.reactance.visibility)
        .attr('stroke', d => this.colorInterpolator(d.i))
      cursorGroupUpdate.select('.electric-length')
        .attr('x2', d => d.electricLength.x)
        .attr('y2', d => d.electricLength.y)
        .attr('visibility', d => d.electricLength.visibility)
        .attr('stroke', d => this.colorInterpolator(d.i))
      cursorGroupUpdate.select('.marker')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', d => this.colorInterpolator(d.i))

      // Exit
      cursorGroup.exit().remove()
    },
    dragSubject () {
      let subject
      let closestDistance2 = math.pow(this.dragRadiusThreshold, 2)

      this.cursorShapes.forEach(function (cursorShape, i) {
        const dx = d3.event.x - cursorShape.x
        const dy = d3.event.y - cursorShape.y
        const distance2 = dx * dx + dy * dy
        if (distance2 < closestDistance2) {
          subject = cursorShape
          closestDistance2 = distance2
        }
      })

      return subject
    },
    dragStarted () {
      d3.select('#cursor-' + d3.event.subject.i).raise()
    },
    dragged () {
      const cursorShape = d3.event.subject

      const x = d3.event.x - CENTER
      const y = -(d3.event.y - CENTER)
      const normX = x / UNIT_RADIUS
      const normY = y / UNIT_RADIUS

      const r = Math.sqrt(math.pow(normX, 2) + math.pow(normY, 2))
      let phi
      if (normX === 0) {
        phi = normY >= 0 ? Math.PI / 2 : -Math.PI / 2
      } else if (normX > 0) {
        phi = Math.atan(normY / normX)
      } else {
        phi = normY >= 0
          ? Math.PI + Math.atan(normY / normX)
          : -Math.PI + Math.atan(normY / normX)
      }
      const gammaPolar = {
        r: r > 1 ? 1 : r,
        phi: phi
      }

      const gamma = math.complex(gammaPolar)
      const impedance = math.divide(math.add(1, gamma), math.subtract(1, gamma))
      const resistance = math.re(impedance)
      const reactance = math.im(impedance)

      cursorShape.cursor.resistance = resistance < 0 ? 0 : resistance
      cursorShape.cursor.reactance = reactance
      cursorShape.cursor.gamma = gammaPolar
    },
    calculateResistanceCircle (value) {
      if (value < 0) {
        window.alert('Resistance can\'t be negative!')
      } else if (value === Infinity) {
        return {
          value: value,
          cx: CENTER + UNIT_RADIUS,
          cy: CENTER,
          r: 1,
          visibility: 'visible'
        }
      }

      return {
        value: value,
        cx: CENTER + UNIT_RADIUS * value / (value + 1),
        cy: CENTER,
        r: Math.abs(UNIT_RADIUS / (value + 1)),
        visbility: 'visible'
      }
    },
    calculateReactanceCircle (value) {
      let path = `M${CENTER + UNIT_RADIUS} ${CENTER} `
      if (value === 0) {
        path += `L ${CENTER - UNIT_RADIUS} ${CENTER}`
      } else {
        const r = Math.abs(UNIT_RADIUS / value)
        const eY = value > 0 ? -2 * r : 2 * r
        const sweepArc = value > 0 ? 1 : 0
        path += `a ${r} ${r} 0 0 ${sweepArc} 0 ${eY}`
      }

      return {
        path: path,
        visibility: 'visible'
      }
    },
    calculateElectricLength (gamma) {
      return {
        x: CENTER + OUTER_RADIUS * Math.cos(gamma.phi),
        y: CENTER - OUTER_RADIUS * Math.sin(gamma.phi),
        visibility: gamma.r > 0.01 ? 'visible' : 'hidden'
      }
    }
  }
}
</script>
