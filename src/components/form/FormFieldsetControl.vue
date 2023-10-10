<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-form-fieldset-control
  label.c-form-fieldset-control__label.u-bold
    | {{ label }}

  .c-form-fieldset-control__value
    slot

  .c-form-fieldset-control__actions(
    v-if="$slots.actions"
  )
    slot(
      name="actions"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script>
export default {
  name: "FormFieldsetControl",

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
$c: ".c-form-fieldset-control";

.c-form-fieldset-control {
  display: flex;
  align-items: center;

  #{$c}__label,
  #{$c}__value,
  #{$c}__actions {
    flex: 0 0 auto;
  }

  #{$c}__label,
  #{$c}__value {
    color: rgb(var(--color-text-primary));
    font-size: 13px;
    letter-spacing: 0.05px;
    line-height: 18px;
  }

  #{$c}__label {
    padding-inline-end: 5px;
  }

  #{$c}__value {
    display: flex;
    align-items: center;
  }

  #{$c}__actions {
    padding-inline-start: 12px;

    > * {
      margin-inline-end: 3px;

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }
}
</style>
