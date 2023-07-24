/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, UserActivity } from "@prose-im/prose-core-client-wasm";
import { defineStore } from "pinia";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type ActivityEntryStatus = {
  icon: string;
  text?: string;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Activity {
  entries: ActivityEntries;
}

interface ActivityEntries {
  [jid: string]: ActivityEntry;
}

interface ActivityEntry {
  id?: string;
  status?: ActivityEntryStatus;
}

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $activity = defineStore("activity", {
  persist: true,

  state: (): Activity => {
    return {
      entries: {}
    };
  },

  getters: {
    getActivity: function () {
      return (jid: JID): ActivityEntry => {
        return this.assert(jid);
      };
    }
  },

  actions: {
    assert(jid: JID): ActivityEntry {
      const bareJIDString = jid.bare().toString();

      // Assign new activity entry for JID?
      if (!(bareJIDString in this.entries)) {
        this.$patch(state => {
          // Insert empty data
          state.entries[bareJIDString] = {};
        });
      }

      return this.entries[bareJIDString];
    },

    setActivity(jid: JID, status?: UserActivity): ActivityEntry {
      // Assert activity
      const activity = this.assert(jid);

      if (status) {
        // Only mutate if activity unique identifier changed
        this.$patch(() => {
          activity.status = { icon: status.icon };

          if (status.text) {
            activity.status.text = status.text;
          }
        });
      } else {
        // Only clear if a previous activity is set
        this.$patch(() => {
          delete activity.id;
          delete activity.status;
        });
      }

      return activity;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $activity;
