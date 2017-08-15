import uuid from 'uuid/v4'
import mergeDescriptors from '../../utils/multi-merge-descriptors'
import cmp from '../ol-virt-cmp'
import useMapCmp from '../ol-use-map-cmp'

const props = {
  id: {
    type: [String, Number],
    default: () => uuid()
  },
  active: {
    type: Boolean,
    default: true
  }
}

const methods = {
  /**
   * @return {Promise<ol.interaction.Interaction>}
   * @protected
   */
  async createOlObject () {
    const interaction = await this.createInteraction()
    interaction.setActive(this.active)
    interaction.set('id', this.id)

    return interaction
  },
  /**
   * @return {ol.interaction.Interaction|Promise<ol.interaction.Interaction>}
   * @protected
   * @abstract
   */
  createInteraction () {
    throw new Error('Not implemented method')
  },
  /**
   * @return {ol.interaction.Interaction|undefined}
   */
  getInteraction () {
    return this.$olObject
  },
  /**
   * @returns {Object}
   * @protected
   */
  getServices () {
    const vm = this

    return mergeDescriptors(this::cmp.methods.getServices(), {
      get interaction () { return vm.$interaction }
    })
  },
  /**
   * @return {Promise} Resolves when initialization completes
   * @protected
   */
  init () {
    return this::cmp.methods.init()
  },
  /**
   * @return {void|Promise<void>}
   * @protected
   */
  deinit () {
    return this::cmp.methods.deinit()
  },
  /**
   * @return {void}
   * @protected
   */
  mount () {
    this.$parent && this.$parent.addInteraction(this)
    this.subscribeAll()
  },
  /**
   * @return {void}
   * @protected
   */
  unmount () {
    this.unsubscribeAll()
    this.$parent && this.$parent.removeInteraction(this)
  },
  /**
   * @return {Promise}
   */
  refresh () {
    return this::cmp.methods.refresh()
  }
}

const watch = {
  active (value) {
    if (this.$interaction && value !== this.$interaction.getActive()) {
      this.$interaction.setActive(value)
    }
  }
}

export default {
  mixins: [cmp, useMapCmp],
  props,
  methods,
  watch,
  stubVNode: {
    empty () {
      return this.$options.name
    }
  },
  created () {
    Object.defineProperties(this, {
      $interaction: {
        enumerable: true,
        get: this.getInteraction
      },
      $map: {
        enumerable: true,
        get: () => this.$services && this.$services.map
      },
      $view: {
        enumerable: true,
        get: () => this.$services && this.$services.view
      }
    })
  }
}
