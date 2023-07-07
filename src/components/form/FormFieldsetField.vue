<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-form-fieldset-field
  label.c-form-fieldset-field__label.u-medium
    | {{ label }}

  .c-form-fieldset-field__input
    slot

  .c-form-fieldset-field__aside(
    v-if="$slots.aside"
  )
    slot(
      name="aside"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script>
export default {
  name: "FormFieldsetField",

  props: {
    label: {
      type: String,
      required: true
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-fieldset-field";

.c-form-fieldset-field {
  margin-block-end: 6px;
  display: flex;
  align-items: center;

  &:last-child {
    margin-block-end: 0;
  }

  #{$c}__label {
    color: $color-text-primary;
    font-size: 14px;
    letter-spacing: 0.1px;
    line-height: 20px;
    width: 100%;
    max-width: 110px;
    padding-inline-end: 8px;
    flex: 0 0 auto;
  }

  #{$c}__input {
    line-height: 0;
    flex: 1;

    &,
    > * {
      width: 100%;
    }
  }

  #{$c}__aside {
    flex: 0 0 auto;
  }
}
</style>
