/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, UserActivity } from "@prose-im/prose-sdk-js";
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
  // TODO: set to false when activity is restored from core library database
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
      const jidString = jid.toString();

      // Assign new activity entry for JID?
      if (!(jidString in this.entries)) {
        this.$patch(state => {
          // Insert empty data
          state.entries[jidString] = {};
        });
      }

      return this.entries[jidString];
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
