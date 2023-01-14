<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "c-global-alert",
    "c-global-alert--" + level
  ]`
)
  span.c-global-alert__badge

  .c-global-alert__text
    p.c-global-alert__text-title
      | Account credentials are invalid

    p.c-global-alert__text-description
      | Can you check your password and try again?

  a.c-global-alert__close(
    href="#"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "GlobalAlert",

  data() {
    return {
      // --> STATE <--

      level: "error"
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss" scoped>
$c: ".c-global-alert";

// VARIABLES
$badge-size: 54px;
$badge-icon-size: 24px;

.c-global-alert {
  background: rgba($color-white, 0.95);
  border: 1px solid rgba($color-black, 0.06);
  padding: 10px;
  padding-inline-end: 80px;
  display: flex;
  align-items: center;
  position: absolute;
  inset-block-end: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  box-shadow: 0 2px 4px 0 rgba($color-black, 0.04);
  border-radius: 16px;

  #{$c}__badge {
    background-color: rgba($color-base-red-normal, 0.15);
    width: $badge-size;
    height: $badge-size;
    margin-inline-end: 24px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;

    &:after {
      content: "";
      background-color: $color-base-red-normal;
      width: $badge-icon-size;
      height: $badge-icon-size;
      flex: 0 0 auto;
    }
  }

  #{$c}__text {
    flex: 1;

    #{$c}__text-title {
      /* TODO */
    }

    #{$c}__text-description {
      /* TODO */
    }
  }

  #{$c}__close {
    flex: 0 0 auto;
  }

  // --> LEVELS <--

  &--error {
    /* TODO */
  }

  &--warning {
    /* TODO */
  }

  &--info {
    /* TODO */
  }

  &--success {
    /* TODO */
  }
}
</style>
