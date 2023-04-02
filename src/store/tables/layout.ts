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
          teamMembers: true,
          otherContacts: false,
          groups: true
        }
      },

      inbox: {
        userinfo: {
          visible: true,

          sections: {
            information: true,
            security: true,
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

    setSidebarSectionTeamMembers(visible: boolean) {
      this.$patch(state => {
        state.sidebar.sections.teamMembers = visible;
      });
    },

    setSidebarSectionOtherContacts(visible: boolean) {
      this.$patch(state => {
        state.sidebar.sections.otherContacts = visible;
      });
    },

    setSidebarSectionGroups(visible: boolean) {
      this.$patch(state => {
        state.sidebar.sections.groups = visible;
      });
    },

    toggleInboxUserinfoVisible() {
      this.$patch(state => {
        state.inbox.userinfo.visible = !state.inbox.userinfo.visible;
      });
    },

    setInboxUserinfoSectionInformation(visible: boolean) {
      this.$patch(state => {
        state.inbox.userinfo.sections.information = visible;
      });
    },

    setInboxUserinfoSectionSecurity(visible: boolean) {
      this.$patch(state => {
        state.inbox.userinfo.sections.security = visible;
      });
    },

    setInboxUserinfoSectionActions(visible: boolean) {
      this.$patch(state => {
        state.inbox.userinfo.sections.actions = visible;
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $layout;
