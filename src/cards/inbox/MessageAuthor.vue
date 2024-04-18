<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-card(
  :anchor="anchor"
  class="c-message-author"
)
  .c-message-author__profile(
    v-if="authorJID"
  )
    base-avatar(
      :jid="authorJID"
      size="80px"
      shadow="none"
      class="c-message-author__avatar"
    )

    .c-message-author__identity
      .c-message-author__detail.c-message-author__detail--name.u-bold(
        v-if="authorName"
      )
        base-presence(
          :jid="authorJID"
          size="small"
          class="c-message-author__detail-presence"
        )

        | {{ authorName}}

      .c-message-author__detail.c-message-author__detail--jid
        | {{ authorJID }}

      .c-message-author__detail.c-message-author__spacer(
        v-if="hasExtendedInformation"
      )

      .c-message-author__detail.c-message-author__detail--job(
        v-if="authorRole"
      )
        | {{ authorRole }}

      .c-message-author__detail.c-message-author__detail--timezone(
        v-if="authorTimezone"
      )
        base-icon(
          name="clock"
          size="10px"
          class="c-message-author__detail-icon"
        )

        | {{ authorTimezone }}

  template(
    v-else
  )
    | Unknown sender
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { Room, JID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";
import { InboxEntryMessage } from "@/store/tables/inbox";

export default {
  name: "MessageAuthor",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    messageId: {
      type: String,
      required: true
    },

    anchor: {
      type: Array<number>,
      required: true
    }
  },

  computed: {
    message(): InboxEntryMessage | void {
      return Store.$inbox.getMessage(this.room.id, this.messageId);
    },

    names(): ReturnType<typeof Store.$inbox.getNames> {
      return Store.$inbox.getNames(this.room.id);
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> | void {
      return this.authorJID !== undefined
        ? Store.$profile.getProfile(this.authorJID)
        : undefined;
    },

    authorJID(): JID | void {
      const jidStringMaybe = this.message?.from || null;

      if (jidStringMaybe !== null) {
        return new JID(jidStringMaybe);
      }

      return undefined;
    },

    authorName(): string | null {
      if (this.authorJID !== undefined) {
        const jidString = this.authorJID.toString();

        return this.names[jidString]?.name || null;
      }

      return null;
    },

    authorRole(): string | null {
      const profileEmployment = this.profile?.employment || null;

      if (profileEmployment !== null) {
        if (profileEmployment.title && profileEmployment.organization) {
          return `${profileEmployment.title} at ${profileEmployment.organization}`;
        }

        return (
          profileEmployment.title || profileEmployment.organization || null
        );
      }

      return null;
    },

    authorTimezone(): string | null {
      const profileTimezone =
        this.profile?.information?.location.timezone || null;

      if (profileTimezone !== null) {
        const nowDate = new Date();

        return `${this.$filters.date.localTime(
          nowDate,
          profileTimezone.offset
        )} (${profileTimezone.name})`;
      }

      return null;
    },

    hasExtendedInformation(): boolean {
      return this.authorRole !== null || this.authorTimezone !== null
        ? true
        : false;
    }
  },

  async mounted() {
    // Acquire profile (as needed)
    await this.acquireProfile();
  },

  methods: {
    // --> HELPERS <--

    async acquireProfile(): Promise<void> {
      if (this.authorJID !== undefined) {
        try {
          await Store.$profile.load(this.authorJID);
        } catch (error) {
          this.$log.error(
            "Failed acquiring user profile (in message author card)",
            error
          );
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-message-author";

#{$c} {
  max-width: 340px;

  #{$c}__profile {
    padding: 3px;
    display: flex;
    align-items: center;
  }

  #{$c}__avatar {
    margin-inline-end: 15px;
  }

  #{$c}__identity {
    #{$c}__spacer {
      height: 4px;
    }

    #{$c}__detail {
      margin-block-end: 4px;
      display: flex;
      align-items: center;

      &:last-child {
        margin-block-end: 0;
      }

      &--name {
        color: rgb(var(--color-text-primary));
        font-size: 15px;
        line-height: 17px;
      }

      &--jid {
        color: rgb(var(--color-text-secondary));
        font-size: 13px;
        line-height: 15px;
      }

      &--job,
      &--timezone {
        color: rgb(var(--color-text-primary));
        font-size: 12px;
        line-height: 14px;
      }

      #{$c}__detail-presence,
      #{$c}__detail-icon {
        margin-inline-end: 4px;
        flex: 0 0 auto;
      }

      #{$c}__detail-presence {
        margin-block-start: 1px;
      }

      #{$c}__detail-icon {
        fill: currentcolor;
      }
    }
  }
}
</style>
