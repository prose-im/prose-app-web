<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-data-table
  .c-base-data-table__header.c-base-data-table__columns
    span.c-base-data-table__column

    span.c-base-data-table__column(
      v-for="column in columns"
      :style=`{
        width: sizes[column.id]
      }`
    )
      | {{ column.label }}

  ul.c-base-data-table__rows
    li.c-base-data-table__row.c-base-data-table__columns(
      v-for="row in rows"
    )
      span.c-base-data-table__column
        form-checkbox(
          v-model="row.selected"
          size="small"
        )

      span(
        v-for="column in columns"
        :style=`{
          width: sizes[column.id]
        }`
        :class=`[
          "c-base-data-table__column",
          "u-select",
          {
            "u-regular": !row.selected,
            "u-medium": row.selected
          }
        ]`
      )
        | {{ row.columns[column.id] ? row.columns[column.id] : "" }}

  .c-base-data-table__controls
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// TYPES
type RowColumns = {
  [id: string]: string;
};

// INTERFACES
export interface Column {
  id: string;
  label: string;
}

export interface Row {
  selected: boolean;
  columns: RowColumns;
}

export interface Sizes {
  [id: string]: string;
}

export default {
  name: "BaseDataTable",

  props: {
    columns: {
      type: Array,
      required: true,

      validator(x: Array<Column>): boolean {
        return x.length > 0;
      }
    },

    rows: {
      type: Array,
      required: true,

      validator(x: Array<Row>): boolean {
        return x.length > 0;
      }
    },

    sizes: {
      type: Object,
      required: true,

      validator(x: Sizes): boolean {
        return Object.keys(x).length > 0;
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-data-table";

.c-base-data-table {
  background-color: $color-background-primary;
  border-block: 1px solid $color-border-primary;

  #{$c}__header,
  #{$c}__rows,
  #{$c}__controls {
    padding-inline: 16px;
  }

  #{$c}__header,
  #{$c}__controls {
    padding-block: 5px;
  }

  #{$c}__header {
    color: $color-text-secondary;
    border-block-end: 1px solid $color-border-secondary;
    font-size: 12px;
    line-height: 20px;

    > #{$c}__column {
      border-inline-end: 1px solid $color-border-tertiary;

      &:last-child {
        border-inline-end: 0 none;
      }
    }
  }

  #{$c}__rows {
    color: $color-text-primary;
    font-size: 13px;
    line-height: 13px;
    min-height: 120px;
    padding-block-start: 4px;
    padding-block-end: 14px;
    overflow: auto;

    #{$c}__row {
      border-block-end: 1px solid $color-border-tertiary;
      padding-block: 4px;
    }
  }

  #{$c}__columns {
    display: flex;
    align-items: center;

    #{$c}__column {
      margin-inline-end: 12px;

      &:nth-child(1) {
        width: ($size-form-checkbox-small-size + 2px);
      }

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }

  #{$c}__controls {
    border-block-start: 1px solid $color-border-secondary;
  }
}
</style>
