/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { defineStore } from "pinia";

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $layout = defineStore("layout", {
  persist: true,

  state: () => {
    return {
      sidebar: {
        sections: {
          spotlight: true,
          favorites: true,
          groups: true,
          channels: true
        }
      },

      inbox: {
        details: {
          visible: true,

          sections: {
            information: true,
            security: true,
            members: true,
            actions: true
          }
        }
      }
    };
  },

  actions: {
    setSidebarSectionSpotlight(visible: boolean) {
      this.$patch(state => {
        state.sidebar.sections.spotlight = visible;
      });
    },

    setSidebarSectionFavorites(visible: boolean) {
      this.$patch(state => {
        state.sidebar.sections.favorites = visible;
      });
    },

    setSidebarSectionGroups(visible: boolean) {
      this.$patch(state => {
        state.sidebar.sections.groups = visible;
      });
    },

    setSidebarSectionChannels(visible: boolean) {
      this.$patch(state => {
        state.sidebar.sections.channels = visible;
      });
    },

    toggleInboxDetailsVisible() {
      this.$patch(state => {
        state.inbox.details.visible = !state.inbox.details.visible;
      });
    },

    setInboxDetailsSectionInformation(visible: boolean) {
      this.$patch(state => {
        state.inbox.details.sections.information = visible;
      });
    },

    setInboxDetailsSectionSecurity(visible: boolean) {
      this.$patch(state => {
        state.inbox.details.sections.security = visible;
      });
    },

    setInboxDetailsSectionMembers(visible: boolean) {
      this.$patch(state => {
        state.inbox.details.sections.members = visible;
      });
    },

    setInboxDetailsSectionActions(visible: boolean) {
      this.$patch(state => {
        state.inbox.details.sections.actions = visible;
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $layout;
