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
  v-hotkey="hotkeys"
  :class=`[
    "c-sidebar-header",
    "c-sidebar-header--platform-" + runtimePlatform
  ]`
  data-tauri-drag-region
)
  .c-sidebar-header__identity
    base-tooltip(
      :bypassed="isIdentityPopoverVisible"
      align="left"
      direction="bottom"
      click="hide"
      tooltip="Manage Workspace"
    )
      base-server-logo(
        @click="onIdentityLogoClick"
        :jid="teamDomainJID"
        :name="teamNameOrDomain"
        size="30px"
        class="c-sidebar-header__identity-logo"
      )

    base-popover-list(
      v-if="isIdentityPopoverVisible"
      @close="onIdentityPopoverClose"
      :items="identityPopoverItems"
      :translucent="translucent"
      class="c-sidebar-header__identity-popover"
    )

  layout-actions(
    class="c-sidebar-header__actions"
  )
    base-tooltip(
      align="right"
      direction="bottom"
      click="hide"
      tooltip="Message Someone"
    )
      base-action(
        @click="onActionMessageClick"
        class="c-sidebar-header__action"
        icon="square.and.pencil"
        size="18px"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";

// PROJECT: ASSEMBLIES
import { AddContactMode as SidebarAddContactMode } from "@/assemblies/app/AppSidebar.vue";

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  platform as runtimePlatform
} from "@/utilities/runtime";

export default {
  name: "SidebarHeader",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    translucent: {
      type: Boolean,
      default: false
    }
  },

  emits: ["addContact"],

  data() {
    return {
      // --> DATA <--

      runtimePlatform,

      // --> STATE <--

      isIdentityPopoverVisible: false
    };
  },

  computed: {
    identityPopoverItems(): Array<PopoverItem> {
      return [
        {
          type: PopoverItemType.Button,
          label: "Invite people",
          click: this.onIdentityPopoverInvitePeopleClick
        },

        {
          type: PopoverItemType.Button,
          label: "Create a channel",
          click: this.onIdentityPopoverCreateChannelClick
        },

        {
          type: PopoverItemType.Divider
        },

        {
          type: PopoverItemType.Button,
          label: "Manage workspace",
          emphasis: true,
          click: this.onIdentityPopoverManageWorkspaceClick
        }
      ];
    },

    hotkeys(): { [name: string]: (event: Event) => void } {
      return {
        "ctrl+n": this.onHotkeyControlN,
        "command+n": this.onHotkeyControlN
      };
    },

    teamDomain(): string {
      return this.jid.domain;
    },

    teamDomainJID(): JID {
      return new JID(this.teamDomain);
    },

    teamNameOrDomain(): string {
      return Store.$account.getWorkspaceName() || this.teamDomain;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onIdentityLogoClick(): void {
      // Toggle popover
      this.isIdentityPopoverVisible = !this.isIdentityPopoverVisible;
    },

    onIdentityPopoverClose(): void {
      // Close popover
      this.isIdentityPopoverVisible = false;
    },

    onIdentityPopoverInvitePeopleClick(): void {
      // Hide identity popover
      this.isIdentityPopoverVisible = false;

      // Request to show add contact modal (in member mode)
      this.$emit("addContact", SidebarAddContactMode.Member);
    },

    onIdentityPopoverCreateChannelClick(): void {
      // Hide identity popover
      this.isIdentityPopoverVisible = false;

      // Request to show add contact modal (in channel mode)
      this.$emit("addContact", SidebarAddContactMode.Channel);
    },

    async onIdentityPopoverManageWorkspaceClick(): Promise<void> {
      // Hide identity popover
      this.isIdentityPopoverVisible = false;

      // Open server administration dashboard
      const manageWorkspaceUrl = `https://admin.prose.${this.teamDomain}/`;

      try {
        await UtilitiesRuntime.requestOpenUrl(manageWorkspaceUrl);
      } catch (error) {
        this.$log.error(
          `Failed opening manage workspace URL: ${manageWorkspaceUrl}`,
          error
        );
      }
    },

    onActionMessageClick(): void {
      // Request to show add contact modal (in member mode)
      this.$emit("addContact", SidebarAddContactMode.Compose);
    },

    onHotkeyControlN(event: Event): void {
      event.preventDefault();
      event.stopPropagation();

      // Request to open compose message popup (alias click event)
      this.onActionMessageClick();
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-header";

#{$c} {
  display: flex;
  align-items: center;

  #{$c}__identity {
    line-height: 0;
    flex: 1;
    position: relative;

    #{$c}__identity-logo {
      cursor: pointer;
      display: block;

      &:hover {
        filter: brightness(105%);
      }

      &:active {
        filter: brightness(98%);
      }
    }

    #{$c}__identity-popover {
      position: absolute;
      inset-inline-start: $size-sidebar-popover-inset-inline-side;
      inset-block-start: calc(
        100% + #{$size-base-popover-list-inset-block-edge-offset}
      );
      z-index: 1;
    }
  }

  #{$c}__actions {
    margin-inline-start: 6px;
    margin-inline-end: (-1 * ($size-base-action-padding-sides - 1px));
    flex: 0 0 auto;
  }

  // --> PLATFORMS <--

  &--platform-macos {
    flex-direction: row-reverse;

    #{$c}__identity {
      flex: 0 0 auto;
    }

    #{$c}__actions {
      margin-inline-start: 0;
      margin-inline-end: 18px;
    }
  }
}
</style>
