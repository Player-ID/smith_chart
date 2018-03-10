// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import * as d3 from 'd3'
import * as math from 'mathjs'
import smithChartSvg from './assets/smith_chart.svg'

Vue.config.productionTip = process.env.NODE_ENV === 'production'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})

var DRAG_HITBOX_RADIUS_THRESHOLD = 20
var MAX_CURSORS = 10

var chartDimensions = {
  width: 1300, // from svg image
  center: 649, // 1300/2 - 1
  unitRadius: 547, // determined experimentally
  outerRadius: 640 // determined experimentally and slightly outside chart
}
var data = [
  {
    resistance: 1,
    reactance: 0
  }
]

data.length = Math.min(data.length, MAX_CURSORS)
data.forEach(function (cursor, i) {
  cursor.resistance = calculateResistanceCircle(
    cursor.resistance,
    chartDimensions.center,
    chartDimensions.unitRadius
  )
  cursor.reactance = calculateReactanceCircle(
    cursor.reactance,
    chartDimensions.center,
    chartDimensions.unitRadius
  )
  cursor.gamma = calculateGamma(
    cursor.resistance,
    cursor.reactance,
    chartDimensions.center,
    chartDimensions.unitRadius
  )
  cursor.i = i
})

var colorInterpolator = d3.scaleOrdinal()
  .range(d3.schemeCategory10)

function calculateResistanceCircle (value, center, unitRadius) {
  if (value < 0) {
    window.alert('Resistance can\'t be negative!')
  } else if (value === Infinity) {
    return {
      value: value,
      cx: center + unitRadius,
      cy: center,
      r: 1
    }
  }

  var cx = center + unitRadius * value / (value + 1)
  var cy = center
  var r = Math.abs(unitRadius / (value + 1))

  return {
    value: value,
    cx: cx,
    cy: cy,
    r: r
  }
}

function calculateReactanceCircle (value, center, unitRadius) {
  if (Math.abs(value) === Infinity) {
    return {
      value: value,
      cx: center + unitRadius,
      cy: center,
      r: 1
    }
  }

  var cx = center + unitRadius
  var cy = center - unitRadius / value
  var r = Math.abs(unitRadius / value)

  return {
    value: value,
    cx: cx,
    cy: cy,
    r: r
  }
}

function calculateGamma (r, x, center, unitRadius) {
  if (r.value === Infinity || Math.abs(x.value) === Infinity) {
    return {
      gamma: math.complex(1, 0).toPolar(),
      x: center + unitRadius,
      y: center
    }
  }

  var z = math.complex(r.value, x.value)
  var gamma = math.divide(math.subtract(z, 1), math.add(z, 1)).toPolar()

  var cx = center + unitRadius * gamma.r * Math.cos(gamma.phi)
  var cy = center - unitRadius * gamma.r * Math.sin(gamma.phi)

  return {
    gamma: gamma,
    x: cx,
    y: cy
  }
}

function dragSubject () {
  var subject
  var closestDistance2 = math.pow(DRAG_HITBOX_RADIUS_THRESHOLD, 2)

  data.forEach(function (cursor, i) {
    var dx = d3.event.x - cursor.gamma.x
    var dy = d3.event.y - cursor.gamma.y
    var distance2 = dx * dx + dy * dy
    if (distance2 < closestDistance2) {
      subject = cursor
      closestDistance2 = distance2
    }
  })

  return subject
}

function dragStarted () {
  d3.select('#cursor' + d3.event.subject.i).raise()
}

function dragged (d) {
  var cursor = d3.event.subject

  var x = d3.event.x - chartDimensions.center
  var y = -(d3.event.y - chartDimensions.center)

  var normX = Math.sign(x) *
        Math.min(Math.abs(x), chartDimensions.unitRadius) / chartDimensions.unitRadius
  var normY = Math.sign(y) *
        Math.min(Math.abs(y), chartDimensions.unitRadius) / chartDimensions.unitRadius

  var r = Math.sqrt(math.pow(normX, 2) + math.pow(normY, 2))
  var phi
  if (normX === 0) {
    phi = normY >= 0 ? Math.PI / 2 : -Math.PI / 2
  } else if (normX > 0) {
    phi = Math.atan(normY / normX)
  } else {
    phi = normY >= 0
      ? Math.PI + Math.atan(normY / normX)
      : -Math.PI + Math.atan(normY / normX)
  }

  var gamma = math.complex({ r: r, phi: phi })
  var impedance = math.divide(math.add(1, gamma), math.subtract(1, gamma))

  cursor.resistance = calculateResistanceCircle(
    math.re(impedance) < 0 ? 0 : math.re(impedance),
    chartDimensions.center,
    chartDimensions.unitRadius
  )
  cursor.reactance = calculateReactanceCircle(
    math.im(impedance),
    chartDimensions.center,
    chartDimensions.unitRadius
  )
  cursor.gamma = {
    gamma: gamma,
    x: chartDimensions.center + chartDimensions.unitRadius * r * Math.cos(phi),
    y: chartDimensions.center - chartDimensions.unitRadius * r * Math.sin(phi)
  }

  var cursorGroup = d3.select('#cursor' + d3.event.subject.i)

  cursorGroup.select('.resistance-circle')
    .attr('cx', cursor.resistance.cx)
    .attr('cy', cursor.resistance.cy)
    .attr('r', cursor.resistance.r)

  cursorGroup.select('.reactance-line')
    .attr('visibility', cursor.reactance.value === 0 ? 'visible' : 'hidden')

  cursorGroup.select('.reactance-arc')
    .attr('cx', cursor.reactance.cx)
    .attr('cy', cursor.reactance.cy)
    .attr('r', cursor.reactance.r)
    .attr('visibility', cursor.reactance.value !== 0 ? 'visible' : 'hidden')

  cursorGroup.select('.electric-length')
    .attr('x2', chartDimensions.center + chartDimensions.outerRadius * Math.cos(phi))
    .attr('y2', chartDimensions.center - chartDimensions.outerRadius * Math.sin(phi))

  cursorGroup.select('.marker')
    .attr('cx', cursor.gamma.x)
    .attr('cy', cursor.gamma.y)
}

var chart = d3.select('#chart-area')
  .append('svg')
  .attr('height', chartDimensions.width)
  .attr('width', chartDimensions.width)
  .attr('viewBox', '0 0 ' + chartDimensions.width + ' ' + chartDimensions.width)
  .call(d3.drag()
    .subject(dragSubject)
    .on('start', dragStarted)
    .on('drag', dragged)
  )

chart.append('image')
  .attr('id', 'smith-chart-image')
  .attr('x', '0')
  .attr('y', '0')
  .attr('width', chartDimensions.width)
  .attr('height', chartDimensions.width)
  .attr('xlink:href', smithChartSvg)

chart.append('rect')
  .attr('id', 'image-blocker')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', chartDimensions.width)
  .attr('height', chartDimensions.width)
  .attr('opacity', '0')

var chartBounds = calculateResistanceCircle(0, chartDimensions.center, chartDimensions.unitRadius)
chart.append('defs')
  .append('clipPath')
  .attr('id', 'boundary-clip')
  .append('circle')
  .attr('cx', chartBounds.cx)
  .attr('cy', chartBounds.cy)
  .attr('r', chartBounds.r)

var cursorGroup = chart.append('g')
  .attr('id', 'cursors')
  .selectAll('g')
  .data(data)
  .enter().append('g')
  .attr('id', function (d) { return 'cursor' + d.i })

cursorGroup.append('circle')
  .attr('class', 'resistance-circle')
  .attr('cx', function (d) { return d.resistance.cx })
  .attr('cy', function (d) { return d.resistance.cy })
  .attr('r', function (d) { return d.resistance.r })
  .attr('stroke', function (d) { return colorInterpolator(d.i) })
  .attr('stroke-width', 3)
  .attr('fill', 'none')

cursorGroup.append('line')
  .attr('class', 'reactance-line')
  .attr('x1', chartDimensions.center - chartDimensions.unitRadius)
  .attr('y1', chartDimensions.center)
  .attr('x2', chartDimensions.center + chartDimensions.unitRadius)
  .attr('y2', chartDimensions.center)
  .attr('stroke', function (d) { return colorInterpolator(d.i) })
  .attr('stroke-width', 3)
  .attr('visibility', function (d) { return d.reactance.value === 0 ? 'visible' : 'hidden' })

cursorGroup.append('circle')
  .attr('class', 'reactance-arc')
  .attr('cx', function (d) { return d.reactance.cx })
  .attr('cy', function (d) { return Math.abs(d.reactance.cy) === Infinity ? 0 : d.reactance.cy })
  .attr('r', function (d) { return d.reactance.r === Infinity ? 0 : d.reactance.r })
  .attr('stroke', function (d) { return colorInterpolator(d.i) })
  .attr('stroke-width', 3)
  .attr('fill', 'none')
  .attr('clip-path', 'url(#boundary-clip)')
  .attr('visibility', function (d) { return d.reactance.value !== 0 ? 'visible' : 'hidden' })

cursorGroup.append('line')
  .attr('class', 'electric-length')
  .attr('x1', chartDimensions.center)
  .attr('y1', chartDimensions.center)
  .attr('x2', function (d) {
    return chartDimensions.center + chartDimensions.outerRadius * Math.cos(d.gamma.gamma.phi)
  })
  .attr('y2', function (d) {
    return chartDimensions.center - chartDimensions.outerRadius * Math.sin(d.gamma.gamma.phi)
  })
  .attr('stroke', function (d) { return colorInterpolator(d.i) })
  .attr('stroke-width', 3)

cursorGroup.append('circle')
  .attr('class', 'marker')
  .attr('cx', function (d) { return d.gamma.x })
  .attr('cy', function (d) { return d.gamma.y })
  .attr('r', 5)
  .attr('fill', function (d) { return colorInterpolator(d.i) })
