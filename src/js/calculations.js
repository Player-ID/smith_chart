import math from 'mathjs'

function calculateGamma (resistance, reactance) {
  if (resistance === Infinity || Math.abs(reactance) === Infinity) {
    return {
      r: 1,
      phi: 0
    }
  }

  const impedance = math.complex(resistance, reactance)
  const gamma = math.divide(math.subtract(impedance, 1), math.add(impedance, 1))
  return gamma.toPolar()
}

function calculateImpedance (r, phi) {
  const gamma = math.complex({ r: r, phi: phi })
  const impedance = math.divide(math.add(1, gamma), math.subtract(1, gamma))
  const resistance = math.re(impedance)
  const reactance = math.im(impedance)
  return {
    resistance: resistance < 0 ? 0 : resistance,
    reactance: reactance
  }
}

function swrToGammaMagnitude (swr) {
  return (swr - 1) / (swr + 1)
}

function gammaMagnitudeToSwr (r) {
  return (1 + r) / (1 - r)
}

function reduceGammaAngle (angle) {
  let limitRotation = Math.sign(angle) * (Math.abs(angle) % (2 * Math.PI))

  if (limitRotation < -Math.PI) {
    limitRotation += 2 * Math.PI
  } else if (limitRotation > Math.PI) {
    limitRotation -= 2 * Math.PI
  }

  return limitRotation
}

function calculateElectricLengthTowardsGenerator (angle) {
  let mirroredAngle = Math.PI - reduceGammaAngle(angle)
  if (mirroredAngle < 0) {
    mirroredAngle += 2 * Math.PI
  }

  return mirroredAngle * 0.5 / (2 * Math.PI)
}

function electricLengthToGammaAngle (length) {
  let mirroredAngle = length * (2 * Math.PI) / 0.5
  mirroredAngle = reduceGammaAngle(mirroredAngle)
  return Math.PI - mirroredAngle
}

export {
  calculateGamma,
  calculateImpedance,
  swrToGammaMagnitude,
  gammaMagnitudeToSwr,
  reduceGammaAngle,
  calculateElectricLengthTowardsGenerator,
  electricLengthToGammaAngle
}
