<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-spotlight-browse-navigate
  list-button(
    v-for="section in sections"
    @click="onSectionClick(section)"
    :active="routeName === section.route"
    :class=`[
      "c-spotlight-browse-navigate__section",
      {
        "c-spotlight-browse-navigate__section--active": (routeName === section.route)
      }
    ]`
  )
    template(
      v-slot:icon
    )
      base-icon(
        :name="section.icon"
        size="16px"
        class="c-spotlight-browse-navigate__section-icon"
      )

    template(
      v-slot:default
    )
      | {{ section.title }}

    template(
      v-if="section.count"
      v-slot:details
    )
      base-count(
        v-if="section.count"
        :count="section.count"
        :color="(routeName === section.route) ? 'white' : 'red'"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import SidebarMainSection from "@/components/sidebar/SidebarMainSection.vue";

// PROJECT: STORES
import Store from "@/store";

// INTERFACES
interface Section {
  route: string;
  title: string;
  icon: string;
  count?: number;
}

export default {
  name: "SpotlightBrowseNavigate",

  components: {
    SidebarMainSection
  },

  computed: {
    routeName(): string {
      return typeof this.$route.name === "string" ? this.$route.name : "";
    },

    presenceRequests(): ReturnType<typeof Store.$presence.getRequests> {
      return Store.$presence.getRequests();
    },

    sections(): Array<Section> {
      return [
        {
          route: "app.spotlight.browse.people",
          title: "People",
          icon: "person.crop.circle"
        },

        {
          route: "app.spotlight.browse.channels",
          title: "Channels",
          icon: "rectangle.stack"
        },

        {
          route: "app.spotlight.browse.invites",
          title: "Invites",
          icon: "bell.fill",
          count: this.presenceRequests.length
        },

        {
          route: "app.spotlight.browse.blocked",
          title: "Blocked",
          icon: "minus.circle.fill"
        }
      ];
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onSectionClick(section: Section): void {
      this.$router.push({
        name: section.route
      });
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-spotlight-browse-navigate";

#{$c} {
  padding-inline: 4px;
  padding-block: 14px;
  box-sizing: border-box;

  #{$c}__section {
    #{$c}__section-icon {
      fill: rgb(var(--color-base-grey-dark));
    }

    &--active {
      #{$c}__section-icon {
        fill: rgb(var(--color-accent-text));
      }
    }
  }
}
</style>
