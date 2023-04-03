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
import { jid } from "@xmpp/jid";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxUserinfoInformation",

  props: {
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
          entries.push({
            id: "active",
            title: `Active ${this.profile.information.lastActive.timestamp} ago`,
            icon: "hand.wave.fill"
          });
        }

        if (this.profile.information.location) {
          if (this.profile.information.location.timezone) {
            entries.push({
              id: "timezone",
              title: `0:00pm (${this.profile.information.location.timezone})`,
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

    profile(): ReturnType<typeof Store.$inbox.getProfile> {
      // TODO: jid from url
      return Store.$inbox.getProfile(jid("valerian@valeriansaliou.name"));
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
