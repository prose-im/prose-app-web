<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
ul.c-base-badge-details
  li(
    v-for="detail in details"
    :class=`[
      "c-base-badge-details__detail",
      "c-base-badge-details__detail--" + detail.color
    ]`
  )
    base-badge(
      :icon="detail.icon"
      :color="detail.color"
      size="26px"
      class="c-base-badge-details__badge"
    )

    .c-base-badge-details__text
      p.c-base-badge-details__title.u-medium
        | {{ detail.title }}

      p.c-base-badge-details__label.u-regular
        | {{ detail.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// INTERFACES
export interface Detail {
  icon: string;
  color: string;
  title: string;
  label: string;
}

export default {
  name: "BaseBadgeDetails",

  props: {
    details: {
      type: Array<Detail>,
      required: true,

      validator(x: Array<Detail>): boolean {
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
$c: ".c-base-badge-details";

#{$c} {
  #{$c}__detail {
    margin-block-end: 12px;
    display: flex;
    align-items: flex-start;

    &:last-child {
      margin-block-end: 0;
    }

    #{$c}__badge {
      margin-inline-end: 10px;
      margin-block-start: 2px;
      flex: 0 0 auto;
    }

    #{$c}__text {
      flex: 1;

      #{$c}__title {
        color: rgb(var(--color-text-primary));
        font-size: ($font-size-baseline - 1.5px);
        line-height: 14px;
      }

      #{$c}__label {
        color: rgb(var(--color-text-secondary));
        font-size: ($font-size-baseline - 2px);
        line-height: 13px;
        margin-block-start: 4px;
      }
    }

    &--red {
      #{$c}__text {
        #{$c}__title {
          color: rgb(var(--color-base-red-normal));
        }
      }
    }

    &--orange {
      #{$c}__text {
        #{$c}__title {
          color: rgb(var(--color-base-orange-dark));
        }
      }
    }
  }
}
</style>
