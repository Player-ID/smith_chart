<template>
  <div>
    <h1>{{ cursorId }}</h1>
    <label>Resistance</label>
    <input v-model.number="cursor.resistance">
    <br>
    <label>Reactance</label>
    <input v-model.number="cursor.reactance">
    <br>
    <label>Reflection Coefficient</label>
    <br>
    <label>|&Gamma;|</label>
    <input v-model.number="cursor.gamma.r">
    <br>
    <label>&ang;&Gamma;</label>
    <input v-model.number="cursor.gamma.phi">
    <br>
    <label>SWR</label>
    <input v-model.number="extra.swr">

    <button @click="remove">Remove Cursor</button>
  </div>
</template>

<script>
import math from 'mathjs'

export default {
  name: 'ControlCursor',
  props: {
    cursorId: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      cursor: {
        resistance: 1,
        reactance: 0,
        gamma: {
          r: 0,
          phi: 0
        }
      },
      extra: {
        swr: 1
      },
      invalidInput: new Set()
    }
  },
  computed: {
    cursorOrigin () {
      return this.$store.state.cursors[this.cursorId]
    }
  },
  watch: {
    cursorOrigin () {
      this.cursor = JSON.parse(JSON.stringify(this.cursorOrigin))
    },
    'cursor.resistance' () {
      this.checkValid(
        'cursor.resistance',
        this.cursor.resistance,
        value => typeof value === 'number' && value >= 0,
        () => {
          const gamma = this.calculateGamma(this.cursor.resistance, this.cursor.reactance)
          this.cursor.gamma.r = gamma.r
          this.cursor.gamma.phi = gamma.phi
        })
    },
    'cursor.reactance' () {
      this.checkValid(
        'cursor.reactance',
        this.cursor.reactance,
        value => typeof value === 'number',
        () => {
          const gamma = this.calculateGamma(this.cursor.resistance, this.cursor.reactance)
          this.cursor.gamma.r = gamma.r
          this.cursor.gamma.phi = gamma.phi
        }
      )
    },
    'cursor.gamma.r' () {
      this.checkValid(
        'cursor.gamma.r',
        this.cursor.gamma.r,
        value => typeof value === 'number' && value >= 0 && value <= 1,
        () => {
          const impedance = this.calculateImpedance(this.cursor.gamma.r, this.cursor.gamma.phi)
          this.cursor.resistance = impedance.resistance
          this.cursor.reactance = impedance.reactance
        }
      )
    },
    'cursor.gamma.phi' () {
      this.checkValid(
        'cursor.gamma.phi',
        this.cursor.gamma.phi,
        value => typeof value === 'number' && Math.abs(value) !== Infinity,
        () => {
          const impedance = this.calculateImpedance(this.cursor.gamma.r, this.cursor.gamma.phi)
          this.cursor.resistance = impedance.resistance
          this.cursor.reactance = impedance.reactance
        }
      )
    },
    'extra.swr' () {
      this.checkValid(
        'extra.swr',
        this.extra.swr,
        value => typeof value === 'number' && value >= 1,
        () => {
          this.cursor.gamma.r = (this.extra.swr - 1) / (this.extra.swr + 1)
          const impedance = this.calculateImpedance(this.cursor.gamma.r, this.cursor.gamma.phi)
          this.cursor.resistance = impedance.resistance
          this.cursor.reactance = impedance.reactance
        }
      )
    }
  },
  methods: {
    checkValid (name, value, checkValid, validCallback) {
      const isValid = checkValid(value)
      if (!isValid) {
        this.invalidInput.add(name)
      } else {
        this.invalidInput.delete(name)
        validCallback()

        if (this.invalidInput.size > 0) return
        this.$store.commit('updateCursor', {
          id: this.cursorId,
          ...JSON.parse(JSON.stringify(this.cursor))
        })
      }
    },
    remove () {
      this.$store.commit('removeCursor', this.cursorId)
    },
    calculateGamma (resistance, reactance) {
      if (resistance === Infinity || Math.abs(reactance) === Infinity) {
        return {
          r: 1,
          phi: 0
        }
      }

      const impedance = math.complex(resistance, reactance)
      const gamma = math.divide(math.subtract(impedance, 1), math.add(impedance, 1))
      return gamma.toPolar()
    },
    calculateImpedance (r, phi) {
      const gamma = math.complex({ r: r, phi: phi })
      const impedance = math.divide(math.add(1, gamma), math.subtract(1, gamma))
      const resistance = math.re(impedance)
      const reactance = math.im(impedance)
      return {
        resistance: resistance,
        reactance: reactance
      }
    }
  }
}
</script>
