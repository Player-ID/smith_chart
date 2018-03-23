function validateNumber (input) {
  const parsedInput = parseFloat(input)
  let result = {
    value: input,
    errors: []
  }

  // Valid examples:
  //    Infinity
  //    -Infinity
  //    +00123
  //    -123.456
  //    123.456E12
  //    +123e-12
  // Invalid examples:
  //    123.
  //    123e
  //    123.e123
  //    e123
  //    e123.45
  //    123abc
  const validNumberRegex = /^[+-]?(?:\d*)(?:[.]\d+)?(?:[Ee][+-]?\d+)?$/m
  const validNumber = validNumberRegex.test(input)
  const empty = input === ''
  const infinity = input === 'Infinity' || input === '-Infinity'
  if (!empty && (validNumber || infinity)) {
    result.value = parsedInput
    return result
  }

  result.errors.push('A number is expected.')
  return result
}

function validateResistance (input) {
  let validatedInput = validateNumber(input)
  if (validatedInput.errors.length !== 0) return validatedInput

  if (validatedInput.value < 0) {
    validatedInput.errors.push('Resistance can\'t be negative.')
  }
  return validatedInput
}

function validateReactance (input) {
  return validateNumber(input)
}

function validateGammaMagnitude (input) {
  let validatedInput = validateNumber(input)
  if (validatedInput.errors.length !== 0) return validatedInput

  if (validatedInput.value < 0 || validatedInput.value > 1) {
    validatedInput.errors.push('Magnitude must be between 0 and 1 inclusive.')
  }
  return validatedInput
}

function validateGammaAngle (input) {
  let validatedInput = validateNumber(input)
  if (validatedInput.errors.length !== 0) return validatedInput

  if (Math.abs(validatedInput.value) === Infinity) {
    validatedInput.errors.push('Angles can\'t be infinite.')
  }
  return validatedInput
}

function validateSwr (input) {
  let validatedInput = validateNumber(input)
  if (validatedInput.errors.length !== 0) return validatedInput

  if (validatedInput.value < 1) {
    validatedInput.errors.push('SWR must be greater than or equal to 1.')
  }
  return validatedInput
}

export {
  validateResistance,
  validateReactance,
  validateGammaMagnitude,
  validateGammaAngle,
  validateSwr
}
