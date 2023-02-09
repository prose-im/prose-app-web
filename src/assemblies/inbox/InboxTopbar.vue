<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-toolbar(
  class="a-inbox-topbar"
)
  template(
    v-slot:left
  )
    layout-actions
      base-action(
        class="a-inbox-topbar__action"
        icon="chevron.left"
        context="grey"
        size="14px"
      )

      base-action(
        class="a-inbox-topbar__action"
        icon="chevron.right"
        context="grey"
        size="14px"
        disabled
      )

      base-action(
        @click="onActionHistoryClick"
        :active="isActionHistoryPopoverVisible"
        class="a-inbox-topbar__action"
        icon="clock"
        context="grey"
        size="18px"
        dropdown
      )
        base-popover-list(
          v-if="isActionHistoryPopoverVisible"
          :items="actionHistoryPopoverItems"
          class="a-inbox-topbar__action-popover"
        )

  template(
    v-slot:middle
  )
    span.a-inbox-topbar__identity.a-inbox-topbar__identity--name
      base-presence(
        class="a-inbox-topbar__identity-badge"
        type="available"
        show="chat"
        size="medium"
      )

      span.u-bold
        | Valerian Saliou

  template(
    v-slot:right
  )
    span.a-inbox-topbar__identity.a-inbox-topbar__identity--jid
      base-icon(
        class="a-inbox-topbar__identity-badge"
        name="checkmark.seal.fill"
        size="16px"
      )

      span.u-regular
        | valerian@crisp.chat

    base-separator(
      class="a-inbox-topbar__separator"
    )

    layout-actions
      base-action(
        class="a-inbox-topbar__action"
        icon="video"
        context="grey"
        size="20px"
      )

      base-action(
        class="a-inbox-topbar__action"
        icon="info.circle"
        context="grey"
        size="18px"
        active
      )

    base-separator(
      class="a-inbox-topbar__separator"
    )

    layout-actions
      base-action(
        class="a-inbox-topbar__action"
        icon="magnifyingglass"
        context="grey"
        size="17px"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxTopbar",

  data() {
    return {
      // --> STATE <--

      isActionHistoryPopoverVisible: false
    };
  },

  computed: {
    actionHistoryPopoverItems() {
      return [
        {
          type: "button",
          label: "History items...",
          color: "blue"
        }
      ];
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionHistoryClick() {
      // Toggle popover
      this.isActionHistoryPopoverVisible = !this.isActionHistoryPopoverVisible;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-topbar";

.a-inbox-topbar {
  #{$c}__separator {
    margin-inline: 14px;
  }

  #{$c}__action {
    #{$c}__action-popover {
      position: absolute;
      inset-inline-start: 0;
      inset-block-start: calc(
        100% + #{$size-base-popover-list-inset-block-edge-offset}
      );
      z-index: 1;
    }
  }

  #{$c}__identity {
    display: flex;
    align-items: center;

    &--name {
      color: $color-text-primary;
      font-size: 16px;

      #{$c}__identity-badge {
        margin-block-start: 1px;
      }
    }

    &--jid {
      color: $color-text-secondary;
      font-size: 15px;

      #{$c}__identity-badge {
        fill: $color-base-green-normal;
        margin-block-start: 2px;
      }
    }

    #{$c}__identity-badge {
      margin-inline-end: 5px;
      flex: 0 0 auto;
    }
  }
}
</style>
