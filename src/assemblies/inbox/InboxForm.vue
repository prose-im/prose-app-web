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
  class="a-inbox-form"
)
  template(
    v-slot:left
  )
    layout-actions
      base-action(
        class="a-inbox-form__action"
        icon="textformat.alt"
        size="18px"
      )

  template(
    v-slot:middle
  )

  template(
    v-slot:right
  )
    layout-actions
      base-action(
        class="a-inbox-form__action"
        icon="paperclip"
        size="18px"
      )

      base-action(
        class="a-inbox-form__action"
        icon="face.smiling"
        size="18px"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxForm"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-form";

.a-inbox-form {
  /* TODO */
}
</style>
