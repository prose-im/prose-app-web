<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
ul.c-base-navigate
  li.c-base-navigate__section(
    v-for="section in sections"
  )
    base-navigate-section(
      @click="onSectionClick(section.id)"
      :title="section.title"
      :label="section.label"
      :icon="section.icon"
      :active="section.id === activeId"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// INTERFACES
export interface Section {
  id: string;
  title: string;
  label?: string;
  icon: string;
}

export default {
  name: "BaseNavigate",

  props: {
    sections: {
      type: Array<Section>,
      required: true,

      validator(x: Array<Section>): boolean {
        return x.length > 0;
      }
    },

    activeId: {
      type: String,
      default: null
    }
  },

  emits: ["navigate"],

  methods: {
    // --> EVENT LISTENERS <--

    onSectionClick(sectionId: string): void {
      this.$emit("navigate", sectionId);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-navigate";

.c-base-navigate {
  #{$c}__section {
    margin-block-end: 2px;

    &:last-child {
      margin-block-end: 0;
    }
  }
}
</style>
