<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-list-browse
  .c-list-browse__loading(
    v-if="loading"
  )
    base-spinner(
      size="14px"
      border-width="1.5px"
    )

  .c-list-browse__empty(
    v-if="!loading && groups.length === 0"
  )
    base-placeholder-image(
      :illustration="emptyIllustration"
      :title="emptyTitle"
      :description="emptyDescription"
    )

  template(
    v-if="groups.length > 0"
  )
    .c-list-browse__group(
      v-for="group in groups"
    )
      .c-list-browse__title(
        v-if="group.title"
      )
        span.c-list-browse__title-name.u-bold.u-ellipsis
          | {{ group.title.name }}

        span.c-list-browse__title-aside.u-ellipsis(
          v-if="group.title.aside"
        )
          | {{ group.title.aside }}

      ul.c-list-browse__results
        list-browse-result(
          v-for="result in group.results"
          :result="result"
          class="c-list-browse__result"
        )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";

// PROJECT: COMPONENTS
import { Result as ListBrowseResult } from "@/components/list/ListBrowseResult.vue";

// TYPES
export type Groups = Array<Group>;

// ENUMERATIONS
export interface Group {
  title?: {
    name: string;
    aside?: string;
  };

  results: Array<ListBrowseResult>;
}

export default {
  name: "ListBrowse",

  props: {
    groups: {
      type: Array as PropType<Groups>,
      required: true
    },

    emptyIllustration: {
      type: String,
      required: true
    },

    emptyTitle: {
      type: String,
      default: "No results found."
    },

    emptyDescription: {
      type: String,
      default: null
    },

    loading: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-list-browse";

.c-list-browse {
  #{$c}__loading,
  #{$c}__empty {
    height: 100%;
    display: flex;
    justify-content: center;
  }

  #{$c}__loading {
    padding-block-start: 5px;
    padding-block-end: 20px;
  }

  #{$c}__empty {
    align-items: center;
  }

  #{$c}__group {
    margin-block-end: 38px;

    &:last-child {
      margin-block-end: 0;
    }

    #{$c}__title {
      line-height: 18px;
      margin-block-end: 14px;
      padding-inline: 6px;
      display: flex;
      align-items: center;

      #{$c}__title-name {
        color: rgb(var(--color-text-primary));
        font-size: 15.5px;
        letter-spacing: 0.1px;
        flex: 1;
      }

      #{$c}__title-aside {
        color: rgb(var(--color-text-secondary));
        font-size: 13.5px;
        margin-inline-start: 8px;
        flex: 0 0 auto;
      }
    }

    #{$c}__results {
      #{$c}__result {
        margin-block-end: 10px;

        &:last-child {
          margin-block-end: 0;
        }
      }
    }
  }
}
</style>
