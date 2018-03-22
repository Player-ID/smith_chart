<template>
  <div>
    <h1>{{ cursorId }}</h1>
    <label>Resistance</label>
    <input
      :value="cursor.resistance"
      @input="debouncedUpdate('resistance', $event)">
    <br>
    <label>Reactance</label>
    <input
      :value="cursor.reactance"
      @input="debouncedUpdate('reactance', $event)">
    <br>
    <label>Reflection Coefficient</label>
    <br>
    <label>|&Gamma;|</label>
    <input
      :value="cursor.gamma.r"
      @input="debouncedUpdate('gamma.r', $event)">
    <br>
    <label>&ang;&Gamma;</label>
    <input
      :value="cursor.gamma.phi"
      @input="debouncedUpdate('gamma.phi', $event)">
    <br>
    <label>SWR</label>
    <input
      :value="derived.swr"
      @input="debouncedUpdate('derived.swr', $event)">

    <button @click="remove">Remove Cursor</button>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'ControlCursor',
  props: {
    cursorId: {
      type: Number,
      default: 1
    }
  },
  data () {
    const cursor = _.cloneDeep(this.$store.state.cursorOptions.default)
    return {
      cursor: cursor,
      derived: {
        swr: (1 + cursor.gamma.r) / (1 - cursor.gamma.r)
      },
      debouncedProcessInput: _.debounce(this.processInput, 300)
    }
  },
  computed: {
    cursorOrigin () {
      return this.$store.state.cursors[this.cursorId]
    }
  },
  watch: {
    cursorOrigin: {
      handler (newVal, oldVal) {
        this.cursor = JSON.parse(JSON.stringify(this.cursorOrigin))
      },
      deep: true
    },
    'cursor.gamma.r' () {
      this.derived.swr = (1 + this.cursor.gamma.r) / (1 - this.cursor.gamma.r)
    }
  },
  methods: {
    debouncedUpdate (field, e) {
      this.debouncedProcessInput(field, e.target.value)
    },
    processInput (field, input) {
      let processedValue
      const parsedInput = parseFloat(input)
      const trailingDecimal = _.endsWith(input, '.')
      if (!Number.isNaN(parsedInput) && !trailingDecimal) {
        switch (field) {
          case 'resistance':
          case 'reactance':
            processedValue = parsedInput
            break
          case 'gamma.r':
            if (parsedInput >= 0 && parsedInput <= 1) {
              processedValue = parsedInput
            }
            break
          case 'gamma.phi':
            if (Math.abs(parsedInput) !== Infinity) {
              processedValue = parsedInput
            }
            break
          case 'derived.swr':
            if (parsedInput >= 1 && parsedInput <= Infinity) {
              field = 'gamma.r'
              const newRho = (parsedInput - 1) / (parsedInput + 1)
              processedValue = newRho
            }
            break
          default:
            return
        }
      }

      if (processedValue !== undefined) {
        this.updateStore(field, processedValue)
      }
    },
    updateStore (field, value) {
      this.$store.commit('updateCursorField', {
        id: this.cursorId,
        field: field,
        value: value
      })
    },
    remove () {
      this.$store.commit('removeCursor', this.cursorId)
    }
  }
}
</script>
