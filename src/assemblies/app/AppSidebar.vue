<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.a-app-sidebar
  sidebar-header(
    @add-contact="onAddContact"
    :class=`[
      "a-app-sidebar__header",
      {
        "a-app-sidebar__header--floating": isHeaderFloating
      }
    ]`
  )

  sidebar-main(
    @add-contact="onAddContact"
    @scroll="onMainScroll"
    class="a-app-sidebar__main"
    disclosure-list-class="a-app-sidebar__main-list"
  )

  sidebar-context(
    :jid="selfJID"
    class="a-app-sidebar__context"
    avatar-presence-class="a-app-sidebar__context-presence"
  )

  add-contact(
    v-if="modals.addContact.visible"
    @add="onModalAddContactAdd"
    @close="onModalAddContactClose"
    :mode="modals.addContact.mode"
    :loading="modals.addContact.loading"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import SidebarHeader from "@/components/sidebar/SidebarHeader.vue";
import SidebarMain from "@/components/sidebar/SidebarMain.vue";
import SidebarContext from "@/components/sidebar/SidebarContext.vue";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: MODALS
import {
  default as AddContact,
  Mode as AddContactMode,
  EventAddOptions as AddContactEventAddOptions
} from "@/modals/sidebar/AddContact.vue";

// CONSTANTS
const MAIN_SCROLLED_THRESHOLD_VERTICAL = 16;

export default {
  name: "AppSidebar",

  components: { SidebarHeader, SidebarMain, SidebarContext, AddContact },

  data() {
    return {
      // --> STATES <--

      isHeaderFloating: false,

      modals: {
        addContact: {
          visible: false,
          loading: false,
          mode: null as AddContactMode | null
        }
      }
    };
  },

  computed: {
    account(): typeof Store.$account {
      return Store.$account;
    },

    selfJID(): JID {
      return this.account.getSelfJID();
    }
  },

  methods: {
    // --> HELPERS <--

    async addContactGroup(jidString: string): Promise<void> {
      const jids = jidString.split(",").map(value => new JID(value.trim()));

      // Start conversation
      const roomJID = await Broker.$room.startConversation(jids);

      // More than one JID involved? A group was created.
      if (jids.length > 1) {
        BaseAlert.success("Group added", "Group has been created");
      }

      // Attempt to navigate to the created room
      this.navigateToCreatedRoom(roomJID);
    },

    async addContactChannel(
      jidString: string,
      requestPrivate = false
    ): Promise<void> {
      let roomJID;

      // Join or create room?
      if (jidString.includes("@") === true) {
        // Join room identified by parsed JID
        roomJID = await Broker.$room.join(new JID(jidString));

        BaseAlert.success("Channel joined", "Channel has been joined");
      } else {
        // Attempt to create private channel
        if (requestPrivate === true) {
          roomJID = await Broker.$room.createPrivateChannel(jidString);

          BaseAlert.success(
            "Channel added",
            "Private channel has been created"
          );
        } else {
          // Attempt to join existing public channel, otherwise create public \
          //   channel
          roomJID = await Broker.$room.findPublicChannelByName(jidString);

          if (roomJID !== undefined) {
            await Broker.$room.join(roomJID);

            BaseAlert.success(
              "Channel joined",
              "Public channel has been joined"
            );
          } else {
            // Attempt to create public channel
            roomJID = await Broker.$room.createPublicChannel(jidString);

            BaseAlert.success(
              "Channel added",
              "Public channel has been created"
            );
          }
        }
      }

      // Attempt to navigate to the created room
      this.navigateToCreatedRoom(roomJID);
    },

    navigateToCreatedRoom(jid?: JID) {
      // Navigate to the created room? (if any JID provided)
      if (jid !== undefined) {
        this.$router.push({
          name: "app.inbox",

          params: {
            roomId: jid.toString()
          }
        });
      }
    },

    // --> EVENT LISTENERS <--

    onAddContact(mode: AddContactMode): void {
      this.modals.addContact.mode = mode;
      this.modals.addContact.visible = true;
    },

    onMainScroll(event: Event): void {
      if (event.target) {
        const forceFloating =
          (event.target as HTMLElement).scrollTop >=
          MAIN_SCROLLED_THRESHOLD_VERTICAL;

        // Update floating marker? (only if changed)
        if (forceFloating !== this.isHeaderFloating) {
          this.isHeaderFloating = forceFloating;
        }
      }
    },

    async onModalAddContactAdd(
      jidString: string,
      options: AddContactEventAddOptions
    ): Promise<void> {
      const mode = this.modals.addContact.mode;

      if (this.modals.addContact.loading !== true) {
        this.modals.addContact.loading = true;

        try {
          switch (mode) {
            case AddContactMode.Member:
              await this.addContactGroup(jidString);

              break;

            case AddContactMode.Channel:
              await this.addContactChannel(jidString, options.private);

              break;
          }

          this.modals.addContact.visible = false;
        } catch (error) {
          BaseAlert.error(
            mode === AddContactMode.Channel
              ? "Channel not added"
              : "Direct Message not opened",

            `${jidString} could not be added`
          );

          this.$log.error("Failed adding contact", error);
        } finally {
          this.modals.addContact.loading = false;
        }
      }
    },

    onModalAddContactClose(): void {
      this.modals.addContact.visible = false;
      this.modals.addContact.mode = null;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-app-sidebar";

// VARIABLES
$sidebar-items-padding-sides: 20px;
$sidebar-main-padding-block: 16px;
$sidebar-header-border-width: 1px;
$sidebar-header-height: $size-inbox-topbar-height;
$sidebar-context-border-width: 1px;
$sidebar-context-height: $size-inbox-form-height;

.a-app-sidebar {
  position: relative;

  &,
  #{$c}__context #{$c}__context-presence {
    background-color: rgb(var(--color-background-secondary));
  }

  #{$c}__header,
  #{$c}__main,
  #{$c}__context {
    padding-inline: $sidebar-items-padding-sides;
  }

  #{$c}__header,
  #{$c}__context {
    background-color: rgba(var(--color-background-secondary), 0.9);
    position: absolute;
    inset-inline: 0;
    backdrop-filter: blur(9px);
  }

  #{$c}__context:before,
  #{$c}__header:after {
    content: "";
    height: $size-layout-gradient-height;
    position: absolute;
    inset-inline: 0;
    pointer-events: none;
  }

  #{$c}__header {
    border-block-end: $sidebar-header-border-width solid transparent;
    height: $sidebar-header-height;
    inset-block-start: 0;
    z-index: 1;
    transition: border-color 100ms linear;

    &:after {
      background-image: linear-gradient(
        0deg,
        rgba(var(--color-black), 0) 0%,
        rgba(var(--color-black), 0.015) 100%
      );
      inset-block-start: calc(100% + 1px);
      display: none;
    }

    &--floating {
      border-block-end-color: rgb(var(--color-border-secondary));

      &:after {
        display: block;
      }
    }
  }

  #{$c}__main {
    padding-block-start: (
      $sidebar-main-padding-block + $sidebar-header-height +
        $sidebar-header-border-width
    );
    padding-block-end: (
      $sidebar-main-padding-block + $sidebar-context-height +
        $sidebar-context-border-width
    );
    overflow-x: hidden;
    overflow-y: auto;
    position: absolute;
    inset: 0;
    z-index: 0;

    #{$c}__main-list {
      margin-inline: (-1 * $sidebar-items-padding-sides);

      > * {
        padding-inline: (
          $sidebar-items-padding-sides - $size-list-button-rounded-margin-inline
        );
      }
    }
  }

  #{$c}__context {
    border-block-start: $sidebar-context-border-width solid
      rgb(var(--color-border-secondary));
    height: $sidebar-context-height;
    inset-block-end: 0;
    z-index: 2;

    &:before {
      background-image: linear-gradient(
        180deg,
        rgba(var(--color-black), 0) 0%,
        rgba(var(--color-black), 0.01) 100%
      );
      inset-block-end: calc(100% + 1px);
    }
  }
}
</style>
