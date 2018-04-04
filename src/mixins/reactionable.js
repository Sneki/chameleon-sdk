import { each, isArray } from 'lodash';

export default {
  data() {
    return {
      eventBusListeners: [],
    };
  },
  computed: {
    eventBus() {
      /*
      eventBus is a vue instance used for communication between
      components. This bus will be used by all elements. Bus is
      exposed as eventBus property of registry from builder state
      or from bundle options (generated apps and test env).
      */
      return this.registry ? this.registry.eventBus : null;
    },
    reactions() {
      return this.definition._reactions;
    },
  },
  methods: {
    /*
    This method sets listeners on eventBus based on reactions
    defined in component. Reaction has signature:
    {
      listener: 'componentName.eventName',
      action: 'actionName',
      params: [],
    }
    */
    setReactions() {
      if (this.eventBus && isArray(this.reactions)) {
        each(this.reactions, (reaction) => {
          if (reaction.listener && reaction.action) {
            const listener = (payload) => {
              /*
              TODO:
              Implement advanced options:
              - Payload mapping
              - Additional params inside reaction
              */
              const method = this[reaction.action];
              if (method) {
                method.call(this, payload);
              }
            };

            this.eventBusListeners.push({
              name: reaction.listener,
              callback: listener,
            });

            this.eventBus.$on(reaction.listener, listener);
          }
        });
      }
    },
    /*
    Unregister listeners from event bus.
    This needs to be called on component destroy.
    */
    removeReactions() {
      if (this.eventBusListeners.length) {
        each(this.eventBusListeners, (listener) => {
          this.eventBus.$off(listener.name, listener.callback);
        });

        this.eventBusListeners = [];
      }
    },
  },
  mounted() {
    this.setReactions();
  },
  beforeDestroy() {
    this.removeReactions();
  },
};
