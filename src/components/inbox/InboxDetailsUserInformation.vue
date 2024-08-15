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
  class="c-inbox-details-user-information"
  separated
)
  list-entry(
    v-for="entry in entries"
    :key="entry.id"
    :color="entry.emoji ? 'lighter' : 'normal'"
    :selectable="entry.selectable"
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
      base-flag(
        v-if="entry.flag"
        :code="entry.flag"
        :width="iconSize"
        height="12px"
        shadow="none"
        class="c-inbox-details-user-information__icon"
      )

      base-icon(
        v-else-if="entry.icon"
        :name="entry.icon"
        :size="iconSize"
        class="c-inbox-details-user-information__icon"
      )

      span.c-inbox-details-user-information__emoji(
        v-else-if="entry.emoji"
      )
        | {{ entry.emoji }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, Availability } from "@prose-im/prose-sdk-js";
import { getCountryCode, getCountryName } from "crisp-countries-languages";

// PROJECT: STORES
import Store from "@/store";

// INTERFACES
interface Entry {
  id: string;
  title: string;
  icon?: string;
  flag?: string;
  emoji?: string;
  selectable?: boolean;
}

export default {
  name: "InboxDetailsUserInformation",

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

  data() {
    return {
      // --> DATA <--

      iconSize: "14px"
    };
  },

  computed: {
    entries(): Array<Entry> {
      const entries: Array<Entry> = [];

      if (this.profile.information?.contact.email) {
        entries.push({
          id: "email",
          title: this.profile.information.contact.email,
          icon: "envelope.fill",
          selectable: true
        });
      }

      if (this.profile.information?.contact.phone) {
        entries.push({
          id: "phone",
          title: this.profile.information.contact.phone,
          icon: "iphone",
          selectable: true
        });
      }

      if (this.profile.information?.lastActive?.timestamp) {
        const activePrefix =
          this.availability !== Availability.Unavailable
            ? "Active"
            : "Last seen";

        entries.push({
          id: "active",
          title: `${activePrefix} ${this.$filters.date.timeAgo(
            this.profile.information.lastActive.timestamp,
            true
          )}`,
          icon: "hand.wave.fill"
        });
      }

      if (this.profile.information?.location) {
        const userTimezone = this.profile.information.location.timezone || null,
          userCountry = this.profile.information.location.country || null;

        if (userTimezone !== null) {
          const nowDate = new Date();

          entries.push({
            id: "timezone",
            title: this.$filters.date.localTime(nowDate, userTimezone.offset),
            icon: "clock.fill"
          });
        }

        if (userCountry !== null) {
          const locationParts = [];

          // Append city? (if any)
          if (this.profile.information.location.city) {
            locationParts.push(this.profile.information.location.city);
          }

          // Append country? (convert code to country name for display, eg. \
          //   'FR'/'fr' becomes 'France')
          const userCountryName = getCountryName(userCountry) || null;

          locationParts.push(userCountryName || userCountry);

          // Acquire user country code (if country name found, then we \
          //   already got a country code, otherwise we need to look it up \
          //   from raw country name)
          let userCountryCode = userCountryName !== null ? userCountry : null;

          if (userCountryCode === null) {
            // Attempt to acquire country code from raw country name (will \
            //   possibly return nothing, eg. 'Germany' will become 'DE')
            userCountryCode = getCountryCode(userCountry) || null;
          }

          entries.push({
            id: "location",
            title: locationParts.join(", "),
            icon: "location.fill",
            flag: userCountryCode || undefined
          });
        }
      }

      if (this.statusActivity.status) {
        entries.push({
          id: "activity",
          title: this.statusActivity.status.text || "Current status",
          emoji: this.statusActivity.status.icon
        });
      }

      // Fallback on JID for user? (if no entries has been set)
      // Notice: this is to avoid the 'empty information' UI issue.
      if (entries.length === 0) {
        entries.push({
          id: "jid",
          title: this.jid.toString(),
          icon: "message",
          selectable: true
        });
      }

      return entries;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    },

    availability(): Availability {
      return Store.$presence.getAvailability(this.jid);
    },

    statusActivity(): ReturnType<typeof Store.$activity.getActivity> {
      return Store.$activity.getActivity(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxDetailsSectionInformation(visible);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-details-user-information";

#{$c} {
  #{$c}__icon {
    fill: lighten-var(var(--color-base-grey-dark), 10%);
  }

  #{$c}__emoji {
    font-size: ($font-size-baseline + 4px);
  }
}
</style>
