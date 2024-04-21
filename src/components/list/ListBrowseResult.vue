<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
li.c-list-browse-result
  .c-list-browse-result__entries
    .c-list-browse-result__entry(
      v-for="entry in result.entries"
    )
      .c-list-browse-result__icon(
        v-if="entry.icon"
      )
        component(
          v-bind="entry.icon.properties"
          :is="entry.icon.component"
        )

      .c-list-browse-result__main
        .c-list-browse-result__identity.u-ellipsis
          span.c-list-browse-result__identity-primary.u-bold
            | {{ entry.identity.primary }}

          span.c-list-browse-result__identity-secondary(
            v-if="entry.identity.secondary"
          )
            | {{ entry.identity.secondary }}

        .c-list-browse-result__preview.u-ellipsis(
          v-if="entry.preview"
        )
          | {{ entry.preview }}

  .c-list-browse-result__actions(
    v-if="result.actions && result.actions.length > 0"
  )
    component(
      v-for="action in result.actions"
      v-bind="action.properties"
      v-on="action.listeners || {}"
      :is="action.component"
    )
      | {{ action.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";

// ENUMERATIONS
export interface Result {
  entries: Array<ResultEntry>;
  actions?: Array<ResultAction>;
}

interface ResultEntry {
  icon?: {
    component: object;
    properties?: object;
  };

  identity: {
    primary: string;
    secondary?: string;
  };

  preview?: string;
}

interface ResultAction {
  component: object;
  label: string;
  properties?: object;
  listeners?: object;
}

export default {
  name: "ListBrowseResult",

  props: {
    result: {
      type: Object as PropType<Result>,
      required: true
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-list-browse-result";

#{$c} {
  background-color: rgb(var(--color-white));
  border: 1px solid rgb(var(--color-border-primary));
  padding-inline: 18px;
  padding-block: 10px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0 2px 6px 0 rgba(var(--color-shadow-primary), 0.02);

  #{$c}__entries {
    flex: 1;
    overflow: hidden;

    #{$c}__entry {
      margin-block-end: 14px;
      display: flex;
      align-items: center;

      &:last-child {
        margin-block-end: 0;
      }

      #{$c}__icon {
        flex: 0 0 auto;
      }

      #{$c}__main {
        flex: 1;
      }
    }
  }

  #{$c}__icon {
    margin-inline-end: 16px;
  }

  #{$c}__main {
    overflow: hidden;

    #{$c}__identity {
      line-height: 16px;
      margin-block-start: -1px;

      #{$c}__identity-primary {
        color: rgb(var(--color-text-primary));
        font-size: 14px;
      }

      #{$c}__identity-secondary {
        color: rgb(var(--color-text-secondary));
        font-size: 13px;
        margin-inline-start: 10px;
      }
    }

    #{$c}__preview {
      color: rgb(var(--color-text-secondary));
      font-size: 12.5px;
      line-height: 14px;
      margin-block-start: 4px;
    }
  }

  #{$c}__actions {
    margin-inline-start: 14px;
    flex: 0 0 auto;

    > * {
      margin-inline-end: 5px;

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }
}
</style>
