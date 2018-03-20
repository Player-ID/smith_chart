<template>
  <div>
    <h1>{{ cursorId }}</h1>
    <button @click="removeCursor()">Remove Cursor</button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ControlCursor',
  props: {
    cursorId: {
      type: Number,
      default: 1
    }
  },
  computed: {
    ...mapState({
      cursor: state => state.cursors[this.cursorId]
    })
  },
  methods: {
    removeCursor () {
      this.$store.commit('removeCursor', this.cursorId)
    }
  }
}
</script>
