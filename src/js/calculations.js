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
    resistance: resistance,
    reactance: reactance
  }
}

function swrToGammaMagnitude (swr) {
  return (swr - 1) / (swr + 1)
}

function gammaMagnitudeToSwr (r) {
  return (1 + r) / (1 - r)
}

export {
  calculateGamma,
  calculateImpedance,
  swrToGammaMagnitude,
  gammaMagnitudeToSwr
}
