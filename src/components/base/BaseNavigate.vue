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
      :title="section.title"
      :label="section.label"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// INTERFACES
export interface Section {
  title: string;
  label: string;
}

export default {
  name: "BaseNavigate",

  props: {
    sections: {
      type: Array,
      required: true,

      validator(x: Array<Section>): boolean {
        return x.length > 0;
      }
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
