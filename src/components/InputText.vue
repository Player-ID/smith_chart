<template>
  <div>
    <label v-if="fieldSpecified">{{ field }}</label>
    <br v-if="fieldSpecified">
    <input
      :value="value"
      @input="update($event)">
    <div v-if="hasErrors">
      !!! {{ priorityError }}
      <div>
        <template v-for="(error, key) in errors">
          {{ error }}
          <br :key="key">
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputText',
  props: {
    field: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number, Symbol],
      default: ''
    },
    errors: {
      type: Array,
      default () {
        return []
      },
      validator (value) {
        return value.length === 0 ||
          value.reduce((isArrayValid, error) => isArrayValid && typeof error === 'string')
      }
    }
  },
  computed: {
    fieldSpecified () {
      return this.field !== ''
    },
    priorityError () {
      return this.errors[0]
    },
    allErrors () {
      return this.errors.join('\n')
    },
    hasErrors () {
      return this.errors.length !== 0
    }
  },
  methods: {
    update (e) {
      this.$emit('update:value', e)
    }
  }
}
</script>
