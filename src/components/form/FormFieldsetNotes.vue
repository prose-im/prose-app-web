<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-form-fieldset-notes
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "FormFieldsetNotes"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-fieldset-notes";

.c-form-fieldset-notes {
  color: rgb(var(--color-text-secondary));
  font-size: 13.5px;
  line-height: 16px;
  margin-block-start: 22px;

  p {
    margin-block-end: 11px;

    &:last-child {
      margin-block-end: 0;
    }
  }
}
</style>
