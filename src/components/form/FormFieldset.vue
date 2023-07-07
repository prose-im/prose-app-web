<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
fieldset.c-form-fieldset
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script>
export default {
  name: "FormFieldset"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-fieldset";

.c-form-fieldset {
  & + #{$c} {
    &:before {
      content: "";
      background-color: $color-border-secondary;
      height: 1px;
      margin-block: 24px;
      display: block;
    }
  }
}
</style>
