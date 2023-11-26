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
    "c-base-data-table",
    {
      "c-base-data-table--auto-height": autoHeight
    }
  ]`
)
  .c-base-data-table__header.c-base-data-table__columns
    span.c-base-data-table__column

    span(
      v-for="column in columns"
      @click="onHeaderColumnClick(column.id)"
      :style=`{
        width: sizes[column.id]
      }`
      :class=`[
        "c-base-data-table__column",
        {
          "c-base-data-table__column--actionable": sortable,
          "c-base-data-table__column--ordered": (column.id === orderBy.columnId)
        }
      ]`
    )
      span(
        :class=`[
          "c-base-data-table__column-label",
          {
            "u-medium": (column.id === orderBy.columnId)
          }
        ]`
      )
        | {{ column.label }}

      base-icon(
        v-if="column.id === orderBy.columnId"
        name="chevron.down"
        size="7px"
        :class=`[
          "c-base-data-table__column-icon",
          {
            "c-base-data-table__column-icon--flipped": (orderBy.direction < 0)
          }
        ]`
      )

  ul.c-base-data-table__rows
    li.c-base-data-table__row.c-base-data-table__columns(
      v-for="row in sortedRows"
    )
      span.c-base-data-table__column
        form-checkbox(
          v-model="row.selected"
          :disabled="readOnly"
          size="small"
        )

      span(
        v-for="column in columns"
        :style=`{
          width: sizes[column.id]
        }`
        :class=`[
          "c-base-data-table__column",
          "u-select"
        ]`
      )
        span(
          :class=`[
            "c-base-data-table__column-label",
            {
              "u-regular": !row.selected,
              "u-medium": row.selected
            }
          ]`
        )
          | {{ row.columns[column.id] ? row.columns[column.id] : "" }}

  .c-base-data-table__controls(
    v-if="controlsWithIcons.length > 0"
  )
    base-tooltip(
      v-for="control in controlsWithIcons"
      :tooltip="control.tooltip"
      :class=`[
        "c-base-data-table__control",
        "c-base-data-table__control--" + control.tint
      ]`
      align="left"
    )
      base-button(
        @click="onControlClick(control.type)"
        :tint="control.tint"
        :disabled="readOnly || control.disabled"
        size="small"
        button-class="c-base-data-table__control-button"
      )
        base-icon(
          :name="control.icon"
          size="10px"
          class="c-base-data-table__control-icon"
        )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { firstBy } from "thenby";

// ENUMERATIONS
export enum ControlType {
  // Add control.
  Add = "add",
  // Remove control.
  Remove = "remove"
}

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

export interface Control {
  type: ControlType;
  tooltip?: string;
}

interface ControlWithIcon {
  type: ControlType;
  tooltip: string;
  tint: string;
  disabled: boolean;
  icon?: string;
}

export default {
  name: "BaseDataTable",

  props: {
    columns: {
      type: Array<Column>,
      required: true,

      validator(x: Array<Column>): boolean {
        return x.length > 0;
      }
    },

    rows: {
      type: Array<Row>,
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
    },

    controls: {
      type: Array<Control>,

      default(): Array<Control> {
        return [];
      }
    },

    sortable: {
      type: Boolean,
      default: false
    },

    readOnly: {
      type: Boolean,
      default: false
    },

    autoHeight: {
      type: Boolean,
      default: false
    }
  },

  emits: ["control"],

  data() {
    return {
      // --> STATE <--

      orderBy: {
        columnId: null as string | null,
        direction: 0 as -1 | 0 | 1
      }
    };
  },

  computed: {
    controlsWithIcons(): Array<ControlWithIcon> {
      return this.controls.map((control: Control) => {
        let icon: string,
          tooltip: string,
          tint = "dark",
          disabled = false;

        switch (control.type) {
          case ControlType.Add: {
            icon = "plus";
            tooltip = "Add";

            break;
          }

          case ControlType.Remove: {
            icon = "minus";
            tooltip = "Remove";
            tint = "light";

            disabled = this.rows.find((row: Row) => row.selected === true)
              ? false
              : true;

            break;
          }
        }

        return {
          type: control.type,
          tooltip: control.tooltip || tooltip,
          icon,
          tint,
          disabled
        };
      });
    },

    sortedRows(): Array<Row> {
      // Sortable, and a sort is active?
      if (
        this.sortable === true &&
        this.orderBy.columnId !== null &&
        this.orderBy.direction !== 0
      ) {
        const columnId = this.orderBy.columnId,
          direction = this.orderBy.direction === -1 ? -1 : 1;

        return [...this.rows].sort(
          firstBy(row => row.columns[columnId], direction)
        );
      }

      return this.rows;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onHeaderColumnClick(columnId: string): void {
      if (this.sortable === true) {
        // Change ordered by column and reset direction back to default? (zero)
        if (this.orderBy.columnId !== columnId) {
          this.orderBy.columnId = columnId;
          this.orderBy.direction = 1;
        } else {
          // Circle back and forth to new direction
          if (this.orderBy.direction >= 1) {
            this.orderBy.direction = -1;
          } else {
            this.orderBy.direction++;
          }

          // New direction is zero? Reset active column
          if (this.orderBy.direction === 0) {
            this.orderBy.columnId = null;
          }
        }
      }
    },

    onControlClick(type: ControlType): void {
      this.$emit("control", type);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-data-table";

// VARIABLES
$controls-button-width: 26px;
$controls-button-height: 22px;

.c-base-data-table {
  background-color: rgb(var(--color-background-primary));
  border-block: 1px solid rgb(var(--color-border-primary));
  min-height: 200px;
  max-height: 340px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  #{$c}__header,
  #{$c}__rows,
  #{$c}__controls {
    padding-inline: 16px;
  }

  #{$c}__header,
  #{$c}__controls {
    flex: 0 0 auto;
  }

  #{$c}__header {
    border-block-end: 1px solid rgb(var(--color-border-secondary));
    font-size: 12px;
    line-height: 14px;
    padding-block: 8px;

    > #{$c}__column {
      border-inline-end: 1px solid rgb(var(--color-border-tertiary));

      &:last-child {
        border-inline-end: 0 none;
      }

      #{$c}__column-label {
        color: rgb(var(--color-text-secondary));
      }

      &--actionable {
        cursor: pointer;

        &:hover {
          #{$c}__column-label {
            color: rgb(var(--color-text-primary));
          }
        }
      }

      &--ordered {
        #{$c}__column-label {
          color: rgb(var(--color-text-primary));
        }
      }
    }
  }

  #{$c}__rows {
    font-size: 13px;
    line-height: 13px;
    padding-block-start: 4px;
    padding-block-end: 14px;
    flex: 1;
    overflow: auto;

    #{$c}__row {
      border-block-end: 1px solid rgb(var(--color-border-tertiary));
      padding-block: 4px;

      > #{$c}__column {
        #{$c}__column-label {
          color: rgb(var(--color-text-primary));
        }
      }
    }
  }

  #{$c}__columns {
    &,
    #{$c}__column {
      display: flex;
      align-items: center;
    }

    #{$c}__column {
      margin-inline-end: 12px;

      &:nth-child(1) {
        width: ($size-form-checkbox-small-size + 2px);
      }

      &:last-child {
        margin-inline-end: 0;
      }

      #{$c}__column-label {
        flex: 1;
      }

      #{$c}__column-icon {
        margin-inline-start: 5px;
        margin-inline-end: 8px;
        flex: 0 0 auto;

        &--flipped {
          transform: scaleY(-1);
        }
      }
    }
  }

  #{$c}__controls {
    border-block-start: 1px solid rgb(var(--color-border-secondary));
    padding-block: 5px;

    #{$c}__control {
      margin-inline-end: 4px;

      &:last-child {
        margin-inline-end: 0;
      }

      #{$c}__control-button {
        width: $controls-button-width;
        height: $controls-button-height;
        padding-inline: 0;
      }

      #{$c}__control-icon {
        margin-inline: auto;
        display: block;
      }

      &--dark {
        #{$c}__control-icon {
          fill: rgb(var(--color-white));
        }
      }

      &--light {
        #{$c}__control-icon {
          fill: rgb(var(--color-black));
        }
      }
    }
  }

  // --> BOOLEANS <--

  &--auto-height {
    min-height: auto;
    max-height: 100%;
  }
}
</style>
