import * as math from 'mathjs'
import { CENTER, UNIT_RADIUS } from './chartConfig.js'

function calculateResistanceCircle (value) {
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

  var cx = CENTER + UNIT_RADIUS * value / (value + 1)
  var cy = CENTER
  var r = Math.abs(UNIT_RADIUS / (value + 1))

  return {
    value: value,
    cx: cx,
    cy: cy,
    r: r
  }
}

function calculateReactanceCircle (value) {
  if (Math.abs(value) === Infinity) {
    return {
      value: value,
      cx: CENTER + UNIT_RADIUS,
      cy: CENTER,
      r: 1
    }
  }

  var cx = CENTER + UNIT_RADIUS
  var cy = CENTER - UNIT_RADIUS / value
  var r = Math.abs(UNIT_RADIUS / value)

  return {
    value: value,
    cx: cx,
    cy: cy,
    r: r
  }
}

function calculateGamma (r, x) {
  if (r === Infinity || Math.abs(x) === Infinity) {
    return {
      gamma: math.complex(1, 0).toPolar(),
      x: CENTER + UNIT_RADIUS,
      y: CENTER
    }
  }

  var z = math.complex(r, x)
  var gamma = math.divide(math.subtract(z, 1), math.add(z, 1)).toPolar()

  var cx = CENTER + UNIT_RADIUS * gamma.r * Math.cos(gamma.phi)
  var cy = CENTER - UNIT_RADIUS * gamma.r * Math.sin(gamma.phi)

  return {
    gamma: gamma,
    x: cx,
    y: cy
  }
}

export {
  calculateGamma,
  calculateReactanceCircle,
  calculateResistanceCircle
}
