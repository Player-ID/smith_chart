<template>
  <div>
    <h3>Cursor {{ cursorId }}</h3>
    <h4>Impedance</h4>
    <InputText
      :value="values.resistance"
      :errors="errors.resistance"
      field="Resistance"
      @update:value="event => debouncedUpdate('resistance', event)"
    />
    <InputText
      :value="values.reactance"
      :errors="errors.reactance"
      field="Reactance"
      @update:value="event => debouncedUpdate('reactance', event)"
    />
    <h4>Reflection Coefficient</h4>
    <InputText
      :value="values['gamma.r']"
      :errors="errors['gamma.r']"
      field="|Γ|"
      @update:value="event => debouncedUpdate('gamma.r', event)"
    />
    <InputText
      :value="values['gamma.phi']"
      :errors="errors['gamma.phi']"
      field="∠Γ"
      @update:value="event => debouncedUpdate('gamma.phi', event)"
    />
    <InputText
      :value="values['derived.swr']"
      :errors="errors['derived.swr']"
      field="SWR"
      @update:value="event => debouncedUpdate('derived.swr', event)"
    />

    <button @click="remove">Remove Cursor</button>
  </div>
</template>

<script>
import InputText from './InputText'

import _ from 'lodash'

import * as validate from '../js/inputValidation.js'
import { gammaMagnitudeToSwr, swrToGammaMagnitude } from '../js/calculations.js'

export default {
  name: 'ControlCursor',
  components: { InputText },
  props: {
    cursorId: {
      type: Number,
      default: 1
    }
  },
  data () {
    const cursor = _.cloneDeep(this.$store.state.cursorOptions.default)
    const values = this.mapCursorToData(cursor)
    const emptiedErrors = this.emptiedErrors()
    return {
      inputFields: ['resistance', 'reactance', 'gamma.r', 'gamma.phi', 'derived.swr'],
      values: values,
      errors: emptiedErrors,
      validators: {
        'resistance': validate.validateResistance,
        'reactance': validate.validateReactance,
        'gamma.r': validate.validateGammaMagnitude,
        'gamma.phi': validate.validateGammaAngle,
        'derived.swr': validate.validateSwr
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
        const cursor = _.cloneDeep(this.cursorOrigin)
        this.values = this.mapCursorToData(cursor)
        this.errors = this.emptiedErrors()
      },
      deep: true
    }
  },
  methods: {
    mapCursorToData (cursor) {
      return {
        'resistance': cursor.resistance,
        'reactance': cursor.reactance,
        'gamma.r': cursor.gamma.r,
        'gamma.phi': cursor.gamma.phi,
        'derived.swr': gammaMagnitudeToSwr(cursor.gamma.r)
      }
    },
    emptiedErrors () {
      return {
        'resistance': [],
        'reactance': [],
        'gamma.r': [],
        'gamma.phi': [],
        'derived.swr': []
      }
    },
    debouncedUpdate (field, e) {
      this.debouncedProcessInput(field, e.target.value)
    },
    processInput (field, input) {
      let validatedInput = this.validators[field](input)
      this.values[field] = validatedInput.value
      this.errors[field] = validatedInput.errors
      if (validatedInput.errors.length !== 0) return

      let updateCommand
      let newValue
      switch (field) {
        case 'derived.swr':
          updateCommand = 'gamma.r'
          newValue = swrToGammaMagnitude(validatedInput.value)
          break
        default:
          updateCommand = field
          newValue = validatedInput.value
          break
      }
      this.updateStore(updateCommand, newValue)
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
