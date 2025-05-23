<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "a-app-sidebar",
    {
      "a-app-sidebar--translucent": runtimeTranslucent,
      "a-app-sidebar--has-alert-bottom": alertUnreadLabel
    }
  ]`
)
  sidebar-header(
    @add-contact="onAddContact"
    :jid="selfJID"
    :translucent="runtimeTranslucent"
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
    :jid="selfJID"
    :translucent="runtimeTranslucent"
    class="a-app-sidebar__main"
    disclosure-list-class="a-app-sidebar__main-list"
  )

  sidebar-context(
    :jid="selfJID"
    :translucent="runtimeTranslucent"
    class="a-app-sidebar__context"
    avatar-presence-class="a-app-sidebar__context-presence"
  )

  base-floater(
    v-if="alertUnreadLabel"
    @click="onAlertUnreadClick"
    class="a-app-sidebar__alert a-app-sidebar__alert--bottom"
    emphasis
  )
    | {{ alertUnreadLabel }}

  open-direct-message(
    v-if="modals.openDirectMessage.visible"
    @open="onModalOpenDirectMessageOpen"
    @close="onModalOpenDirectMessageClose"
    :loading="modals.openDirectMessage.loading"
    :compose="modals.openDirectMessage.compose"
  )

  add-channel(
    v-if="modals.addChannel.visible"
    @add="onModalAddChannelAdd"
    @close="onModalAddChannelClose"
    :loading="modals.addChannel.loading"
  )

  account-welcome(
    v-if="popups.accountWelcome.visible"
    @complete="onPopupAccountWelcomeComplete"
    @close="onPopupAccountWelcomeClose"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, SidebarItem, RoomID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import SidebarHeader from "@/components/sidebar/SidebarHeader.vue";
import SidebarMain from "@/components/sidebar/SidebarMain.vue";
import SidebarContext from "@/components/sidebar/SidebarContext.vue";

// PROJECT: COMPOSABLES
import { useInterfaceMounted } from "@/composables/interface";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: POPUPS
import AccountWelcome from "@/popups/sidebar/AccountWelcome.vue";

// PROJECT: MODALS
import OpenDirectMessage from "@/modals/sidebar/OpenDirectMessage.vue";
import {
  default as AddChannel,
  EventAddOptions as AddChannelEventAddOptions
} from "@/modals/sidebar/AddChannel.vue";

// PROJECT: UTILITIES
import { translucent as runtimeTranslucent } from "@/utilities/runtime";

// ENUMERATIONS
export enum AddContactMode {
  // Compose mode.
  Compose = "compose",
  // Member mode.
  Member = "member",
  // Channel mode.
  Channel = "channel"
}

// CONSTANTS
const MAIN_SCROLLED_THRESHOLD_VERTICAL = 16;

export default {
  name: "AppSidebar",

  components: {
    SidebarHeader,
    SidebarMain,
    SidebarContext,
    OpenDirectMessage,
    AddChannel,
    AccountWelcome
  },

  setup() {
    useInterfaceMounted((mounted: boolean) => {
      Store.$session.setInterfaceSidebarMounted(mounted);
    });
  },

  data() {
    return {
      // --> DATA <--

      runtimeTranslucent,

      // --> STATES <--

      isHeaderFloating: false,

      modals: {
        openDirectMessage: {
          visible: false,
          loading: false,
          compose: false
        },

        addChannel: {
          visible: false,
          loading: false
        }
      },

      popups: {
        accountWelcome: {
          visible: false
        }
      }
    };
  },

  computed: {
    totalUnreadCount(): number {
      // Acquire total unread count, except unread count from the \
      //   currently-open room (if any)
      return this.items.reduce((accumulator, item) => {
        return (
          accumulator + (this.roomId !== item.room.id ? item.unreadCount : 0)
        );
      }, 0);
    },

    alertUnreadLabel(): string | null {
      if (this.totalUnreadCount > 0) {
        return `${this.totalUnreadCount} unread ${
          this.totalUnreadCount === 1 ? "message" : "messages"
        }`;
      }

      return null;
    },

    roomId(): RoomID | null {
      return (this.$route.params.roomId as RoomID) || null;
    },

    account(): typeof Store.$account {
      return Store.$account;
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    selfJID(): JID {
      return this.account.getSelfJID();
    },

    items(): Array<SidebarItem> {
      return Store.$room.getItems();
    }
  },

  mounted() {
    // Check if should show welcome
    this.checkPopupAccountWelcomeOpen();
  },

  methods: {
    // --> HELPERS <--

    async openDirectMessage(jids: Array<JID>): Promise<void> {
      // Start conversation
      const roomJID = await Broker.$room.startConversation(jids);

      // More than one JID involved? A group was created.
      if (jids.length > 1) {
        BaseAlert.success("Group added", "Group has been created");
      }

      // Attempt to navigate to the created room
      this.navigateToCreatedRoom(roomJID);
    },

    async addChannel(jidString: string, requestPrivate = false): Promise<void> {
      let roomJID;

      // Join or create room?
      if (jidString.includes("@") === true) {
        // Join room identified by parsed JID
        roomJID = await Broker.$room.join(new JID(jidString));

        BaseAlert.success("Channel joined", "Channel has been joined");
      } else {
        // Attempt to create private channel
        if (requestPrivate === true) {
          roomJID = await Broker.$channel.createPrivateChannel(jidString);

          BaseAlert.success(
            "Channel added",
            "Private channel has been created"
          );
        } else {
          // Attempt to join existing public channel, otherwise create public \
          //   channel
          roomJID = await Broker.$channel.findPublicChannelByName(jidString);

          if (roomJID !== undefined) {
            await Broker.$room.join(roomJID);

            BaseAlert.success(
              "Channel joined",
              "Public channel has been joined"
            );
          } else {
            // Attempt to create public channel
            roomJID = await Broker.$channel.createPublicChannel(jidString);

            // Force reload all channels
            Store.$channel.markChannelsChanged();

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
      // Notice: do not open conversation here, since this could perform \
      //   network checks, and we know that the room definitely exists at this \
      //   point.
      if (jid !== undefined) {
        this.$router.push({
          name: "app.inbox",

          params: {
            roomId: jid.toString()
          }
        });
      }
    },

    checkPopupAccountWelcomeOpen(): void {
      const shouldOpenWelcome = this.session.onboarding.welcome;

      // Open welcome popup?
      if (shouldOpenWelcome === true) {
        this.popups.accountWelcome.visible = true;
      }
    },

    // --> EVENT LISTENERS <--

    onAddContact(mode: AddContactMode): void {
      // Open target modal
      switch (mode) {
        case AddContactMode.Compose:
        case AddContactMode.Member: {
          this.modals.openDirectMessage.visible = true;

          this.modals.openDirectMessage.compose =
            mode === AddContactMode.Compose ? true : false;

          break;
        }

        case AddContactMode.Channel: {
          this.modals.addChannel.visible = true;

          break;
        }
      }
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

    onAlertUnreadClick(): void {
      // Attempt to find first unread item (if any)
      let unreadItem = this.items.find(item => {
        return item.unreadCount > 0 && item.room.id !== this.roomId;
      });

      // Any unread item found? Navigate to room
      if (unreadItem !== undefined) {
        this.$router.push({
          name: "app.inbox",

          params: {
            roomId: unreadItem.room.id
          }
        });
      }
    },

    async onModalOpenDirectMessageOpen(
      jidStrings: Array<string>
    ): Promise<void> {
      if (this.modals.openDirectMessage.loading !== true) {
        this.modals.openDirectMessage.loading = true;

        try {
          // Convert JID strings to pure JIDs (might fail)
          const jids = jidStrings.map(value => new JID(value));

          // Open direct message (one or many persons)
          await this.openDirectMessage(jids);

          this.modals.openDirectMessage.visible = false;
        } catch (error) {
          this.$log.error("Failed opening direct message", error);

          BaseAlert.error(
            "Direct Message not opened",
            `${jidStrings.join(", ")} could not be added`
          );
        } finally {
          this.modals.openDirectMessage.loading = false;
        }
      }
    },

    onModalOpenDirectMessageClose(): void {
      this.modals.openDirectMessage.visible = false;
    },

    async onModalAddChannelAdd(
      jidString: string,
      options: AddChannelEventAddOptions
    ): Promise<void> {
      if (this.modals.addChannel.loading !== true) {
        this.modals.addChannel.loading = true;

        try {
          // Create or join channel (public or private)
          await this.addChannel(jidString, options.private);

          this.modals.addChannel.visible = false;
        } catch (error) {
          this.$log.error("Failed adding channel", error);

          BaseAlert.error(
            "Channel not added",
            `${jidString} could not be added`
          );
        } finally {
          this.modals.addChannel.loading = false;
        }
      }
    },

    onModalAddChannelClose(): void {
      this.modals.addChannel.visible = false;
    },

    onPopupAccountWelcomeComplete(): void {
      // Mark welcome onboarding as complete
      this.session.setOnboardingWelcome(false);

      // Trigger close event
      this.onPopupAccountWelcomeClose();
    },

    onPopupAccountWelcomeClose(): void {
      this.popups.accountWelcome.visible = false;
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
$sidebar-header-height: $size-layout-view-topbar-height;
$sidebar-context-border-width: 1px;
$sidebar-context-height: $size-inbox-form-height;
$sidebar-alert-edge-offset: 16px;

#{$c} {
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
  }

  #{$c}__context:before,
  #{$c}__header:after {
    content: "";
    height: $size-common-gradient-height;
    position: absolute;
    inset-inline: 0;
    pointer-events: none;
  }

  #{$c}__header {
    border-block-end: $sidebar-header-border-width solid transparent;
    height: $sidebar-header-height;
    inset-block-start: 0;
    z-index: 1;
    transition: all 100ms linear;
    transition-property: background-color, border-color;

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
      backdrop-filter: blur(9px);

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
    padding-block-end: $sidebar-main-padding-block;
    overflow-x: hidden;
    overflow-y: auto;
    position: absolute;
    inset: 0;
    inset-block-end: $sidebar-context-height + $sidebar-context-border-width;
    z-index: 0;

    #{$c}__main-list {
      margin-inline: -$sidebar-items-padding-sides;

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
    z-index: 3;

    &:before {
      background-image: linear-gradient(
        180deg,
        rgba(var(--color-black), 0) 0%,
        rgba(var(--color-black), 0.01) 100%
      );
      inset-block-end: calc(100% + 1px);
    }
  }

  #{$c}__alert {
    box-sizing: border-box;
    width: max-content;
    max-width: calc(100% - (2 * #{$sidebar-items-padding-sides}));
    position: absolute;
    inset-inline-start: 50%;
    z-index: 2;
    transform: translateX(-50%);

    &--bottom {
      inset-block-end: ($sidebar-context-height + $sidebar-alert-edge-offset);
    }
  }

  // --> BOOLEANS <--

  &--translucent {
    background-color: rgba(var(--color-background-secondary), 0.8);

    #{$c}__header {
      background-color: transparent;

      &--floating {
        background-color: rgba(var(--color-background-secondary), 0.75);
        border-block-end-color: rgba(var(--color-shadow-primary), 0.1);
      }
    }

    #{$c}__context {
      background-color: rgba(var(--color-background-secondary), 0.3);
      border-block-start-color: rgba(var(--color-shadow-primary), 0.06);

      #{$c}__context-presence {
        background-color: rgba(var(--color-background-secondary), 0.8);
        backdrop-filter: blur(6px);
      }
    }
  }

  &--has-alert-bottom {
    #{$c}__main {
      padding-block-end: ($sidebar-main-padding-block + 46px);
    }
  }
}
</style>
