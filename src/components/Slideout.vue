<template>
  <div class="slideout-container">
    <nav :id="menu">
      <slot name="menu"/>
    </nav>
    <main :id="panel">
      <slot name="panel"/>
    </main>
  </div>
</template>

<script>
import Slideout from 'slideout'

export default {
  name: 'Slideout',
  props: {
    panel: {
      type: String,
      default: 'panel'
    },
    menu: {
      type: String,
      default: 'menu'
    },
    duration: {
      type: Number,
      default: 300
    },
    easing: {
      type: String,
      default: 'ease',
      validator: value => {
        const acceptedValues = [
          'ease',
          'linear',
          'ease-in',
          'ease-out',
          'ease-in-out',
          'step-start',
          'step-end',
          'cubic-bezier'
        ]
        return acceptedValues.findIndex(option => option === value) !== -1
      }
    },
    padding: {
      type: Number,
      default: 256
    },
    tolerance: {
      type: Number,
      default: 70
    },
    touch: {
      type: Boolean,
      default: true
    },
    side: {
      type: String,
      default: 'left',
      validator: value => value === 'left' || value === 'right'
    },
    toggleSelectors: {
      type: Array,
      default () { return [] }
    }
  },
  data () {
    return {
      slideout: null
    }
  },
  mounted () {
    this.slideout = new Slideout({
      'panel': this.$el.querySelector(`#${this.panel}`),
      'menu': this.$el.querySelector(`#${this.menu}`),
      'duration': this.duration,
      'easing': this.easing,
      'padding': this.padding,
      'tolerance': this.tolerance,
      'touch': this.touch,
      'side': this.side
    })
    this.toggleSelectors.forEach(selector => {
      const element = document.querySelector(selector)
      if (element) {
        element.addEventListener('click', () => {
          this.slideout.toggle()
        })
      }
    })

    const events = [
      'beforeclose',
      'close',
      'beforeopen',
      'open',
      'translatestart',
      'translate',
      'translateend'
    ]
    events.forEach(event => {
      this.slideout.on(event, (data) => {
        this.$emit('on-' + event, data)
      })
      this.slideout.once(event, (data) => {
        this.$emit('once-' + event, data)
      })
    })
  }
}
</script>

<style>
body {
  width: 100%;
  height: 100%;
}

.slideout-container {
  padding: 0;
  margin: 0;
}

.slideout-menu {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 256px;
  min-height: 100vh;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  z-index: 0;
  display: none;
}

.slideout-menu-left {
  left: 0;
}

.slideout-menu-right {
  right: 0;
}

.slideout-panel {
  position: relative;
  z-index: 1;
  will-change: transform;
  background-color: #FFF; /* A background-color is required */
  min-height: 100vh;
}

.slideout-open,
.slideout-open body,
.slideout-open .slideout-panel {
  overflow: hidden;
}

.slideout-open .slideout-menu {
  display: block;
}
</style>
