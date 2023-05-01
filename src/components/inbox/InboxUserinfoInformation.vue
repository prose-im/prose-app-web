<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-disclosure(
  @toggle="onToggle"
  :header-class="headerClass"
  title="Information"
  class="c-inbox-userinfo-information"
  separated
)
  list-entry(
    v-for="entry in entries"
    :key="entry.id"
    :color="entry.emoji ? 'lighter' : 'normal'"
    :class=`{
      [itemClass]: itemClass
    }`
  )
    template(
      v-slot:default
    )
      | {{ entry.title }}

    template(
      v-slot:icon
    )
      base-icon(
        v-if="entry.icon"
        :name="entry.icon"
        size="14px"
        class="c-inbox-userinfo-information__icon"
      )

      span.c-inbox-userinfo-information__emoji
        | {{ entry.emoji }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxUserinfoInformation",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    headerClass: {
      type: String,
      default: null
    },

    itemClass: {
      type: String,
      default: null
    }
  },

  computed: {
    entries() {
      const entries = [];

      if (this.profile.information) {
        if (this.profile.information.contact) {
          if (this.profile.information.contact.email) {
            entries.push({
              id: "email",
              title: this.profile.information.contact.email,
              icon: "envelope.fill"
            });
          }

          if (this.profile.information.contact.phone) {
            entries.push({
              id: "email",
              title: this.profile.information.contact.phone,
              icon: "envelope.fill"
            });
          }
        }

        if (this.profile.information.lastActive) {
          const activePrefix =
            this.highestPresence.type === null ? "Active" : "Last seen";

          entries.push({
            id: "active",
            title: `${activePrefix} ${this.$filters.date.timeAgo(
              this.profile.information.lastActive.timestamp,
              true
            )}`,
            icon: "hand.wave.fill"
          });
        }

        if (this.profile.information.location) {
          const userTimezone =
            this.profile.information.location.timezone || null;

          if (userTimezone !== null) {
            const nowDate = new Date();

            entries.push({
              id: "timezone",
              title: `${this.$filters.date.localTime(
                nowDate,
                userTimezone.offset
              )} (${userTimezone.name})`,
              icon: "clock.fill"
            });
          }

          if (this.profile.information.location.country) {
            const locationParts = [];

            if (this.profile.information.location.city) {
              locationParts.push(this.profile.information.location.city);
            }

            locationParts.push(this.profile.information.location.country);

            entries.push({
              id: "location",
              title: locationParts.join(", "),
              icon: "location.fill"
            });
          }
        }

        if (this.profile.information.activity) {
          entries.push({
            id: "activity",
            title: this.profile.information.activity.text,
            emoji: this.profile.information.activity.icon
          });
        }
      }

      return entries;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    },

    highestPresence(): ReturnType<typeof Store.$presence.getHighest> {
      return Store.$presence.getHighest(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxUserinfoSectionInformation(visible);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-userinfo-information";

.c-inbox-userinfo-information {
  #{$c}__icon {
    fill: lighten($color-base-grey-dark, 10%);
  }

  #{$c}__emoji {
    font-size: 18px;
  }
}
</style>
