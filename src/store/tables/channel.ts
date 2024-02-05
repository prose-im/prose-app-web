/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum ChannelType {
  // Public channel.
  Public = "public"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type ChannelList = Array<ChannelEntry>;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Channel {
  list: ChannelList;
}

interface ChannelEntry {
  type: ChannelType;
  jid: string;
  name: string;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  loaded: false
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $channel = defineStore("channel", {
  persist: false,

  state: (): Channel => {
    return {
      list: []
    };
  },

  getters: {
    getList: function () {
      return (): ChannelList => {
        return this.list;
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    async load(reload = false): Promise<ChannelList> {
      // Load channels? (or reload)
      if (LOCAL_STATES.loaded === false || reload === true) {
        LOCAL_STATES.loaded = true;

        // Initialize entries
        const entries: ChannelList = [];

        // Load all public channels
        const publicChannels = await Broker.$channel.loadPublicChannels();

        publicChannels.forEach(publicChannel => {
          entries.push({
            type: ChannelType.Public,
            jid: publicChannel.jid.toString(),
            name: publicChannel.name
          });
        });

        this.$patch(state => {
          state.list = entries;
        });
      }

      return this.list;
    },

    markChannelsChanged(): void {
      EventBus.emit("channels:changed");
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { ChannelType };
export type { ChannelEntry };
export default $channel;
