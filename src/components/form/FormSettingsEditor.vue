<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-form-settings-editor
  form-fieldset(
    v-for="fieldset in fieldsets"
    :id="'fieldset_' + fieldset.id"
    :class=`[
      "c-form-settings-editor__fieldset",
      {
        [fieldsetClass]: fieldsetClass
      }
    ]`
  )
    h6(
      :class=`[
        "c-form-settings-editor__title",
        "u-medium",
        {
          [titleClass]: titleClass
        }
      ]`
    )
      | {{ fieldset.title }}

    template(
      v-if="fieldset.parts"
    )
      component(
        v-for="part in fieldset.parts"
        v-bind="part.properties"
        v-on="part.listeners || {}"
        :is="part.component"
        :class=`[
          {
            [partClass]: partClass
          }
        ]`
      )

    template(
      v-if="fieldset.fields"
    )
      form-fieldset-field(
        v-for="field in fieldset.fields"
        :label="field.label || ''"
        class="c-form-settings-editor__field"
      )
        template(
          v-slot:default
        )
          form-field(
            v-if="field.type === 'input'"
            v-model="field.data.value.inner"
            @change="field.data.value.change"
            :name="field.id"
            :size="fieldSize"
            :placeholder="field.data.placeholder"
            :disabled="field.data.disabled"
            type="text"
            align="left"
          )

          form-field(
            v-else-if="field.type === 'textarea'"
            v-model="field.data.value.inner"
            @change="field.data.value.change"
            :name="field.id"
            :size="fieldSize"
            :placeholder="field.data.placeholder"
            :disabled="field.data.disabled"
            type="textarea"
            align="left"
          )

          form-select(
            v-else-if="field.type === 'select'"
            v-model="field.data.value.inner"
            @change="field.data.value.change"
            :options="field.data.options"
            :icon="field.data.icon"
            :name="field.id"
            :size="fieldSize"
            :placeholder="field.data.placeholder"
            :position="field.data.position"
            :search="field.data.options.length > 10"
            :disabled="field.data.disabled"
          )

          form-checkbox(
            v-else-if="field.type === 'checkbox'"
            v-model="field.data.value.inner"
            @change="field.data.value.change"
            :name="field.id"
            :disabled="field.data.disabled"
            size="small"
          )
            template(
              v-if="field.data.label"
              v-slot:default
            )
              | {{ field.data.label }}

          form-toggle(
            v-else-if="field.type === 'toggle'"
            v-model="field.data.value.inner"
            @change="field.data.value.change"
            :name="field.id"
            :disabled="field.data.disabled"
          )

          base-indicator-level(
            v-else-if="field.type === 'level'",
            :percent="field.data.value.inner"
            :disabled="field.data.disabled"
          )

          base-stream-view(
            v-else-if="field.type === 'stream'",
            :stream-url="field.data.value.inner"
            :disabled="field.data.disabled"
          )

          base-button(
            v-else-if="field.type === 'button'",
            @click="field.data.click"
            :tint="field.data.tint || 'light'"
            :size="fieldSize"
            :reverse="field.data.reverse"
            :disabled="field.data.disabled"
          )
            | {{ field.data.text }}

          span.c-form-settings-editor__field-spacer(
            v-else-if="field.type === 'spacer'"
          )

        template(
          v-slot:aside
        )
          div(
            v-if="fieldset.options && fieldset.options.aside"
            :class=`[
              "c-form-settings-editor__field-aside",
              "c-form-settings-editor__field-aside--" + fieldset.options.aside
            ]`
          )
            template(
              v-if="field.aside"
            )
              a(
                v-if="field.aside.type === 'link'"
                @click="field.aside.click"
                :class=`[
                  "c-form-settings-editor__field-aside-link",
                  "u-medium",
                  {
                    "c-form-settings-editor__field-aside-link--disabled": (field.aside.disabled || (field.data.initial && field.data.initial === field.data.value.inner))
                  }
                ]`
              )
                | {{ field.aside.label }}

              span(
                v-else-if="field.aside.type === 'label'"
                :class=`[
                  "c-form-settings-editor__field-aside-label",
                  {
                    ["c-form-settings-editor__field-aside-label--" + field.aside.color]: field.aside.color
                  }
                ]`
              )
                base-icon(
                  v-if="field.aside.icon"
                  :name="field.aside.icon"
                  size="13px"
                  class="c-form-settings-editor__field-aside-icon"
                )

                | {{ field.aside.label }}

    .c-form-settings-editor__controls(
      v-if="fieldset.controls"
    )
      form-fieldset-control(
        v-for="control in fieldset.controls"
        :label="control.label"
        class="c-form-settings-editor__control"
      )
        template(
          v-slot:default
        )
          base-icon(
            v-if="control.icon"
            :name="controlIconToName(control.icon)"
            :size="controlIconToSize(control.icon)"
            :class=`[
              "c-form-settings-editor__control-icon",
              "c-form-settings-editor__control-icon--" + controlIconToColor(control.icon)
            ]`
          )

          | {{ control.value }}

        template(
          v-if="control.actions && control.actions.length > 0"
          v-slot:actions
        )
          template(
            v-for="action in control.actions"
          )
            base-button(
              v-if="action.type === 'button'",
              :disabled="action.data.disabled"
              tint="light"
              size="mid-small"
            )
              | {{ action.data.text }}

    form-fieldset-notes(
      v-if="fieldset.notes"
    )
      p(
        v-for="note in fieldset.notes"
      )
        | {{ note }}

  slot(
    name="modals"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import {
  Option as FormSelectOption,
  Icon as FormSelectIcon
} from "@/components/form/FormSelect.vue";

// ENUMERATIONS
export enum FieldsetFieldType {
  // Input type.
  Input = "input",
  // Textarea type.
  Textarea = "textarea",
  // Select type.
  Select = "select",
  // Checkbox type.
  Checkbox = "checkbox",
  // Toggle type.
  Toggle = "toggle",
  // Level type.
  Level = "level",
  // Stream type.
  Stream = "stream",
  // Button type.
  Button = "button",
  // Spacer type.
  Spacer = "spacer"
}

export enum FieldsetFieldAsideType {
  // Label type.
  Label = "label",
  // Link type.
  Link = "link"
}

export enum FieldsetControlActionType {
  // Button type.
  Button = "button"
}

export enum FieldsetControlIconType {
  // Location active type.
  LocationActive = "location-active",
  // Location inactive type.
  LocationInactive = "location-inactive",
  // Status enabled type.
  StatusEnabled = "status-enabled",
  // Status disabled type.
  StatusDisabled = "status-disabled"
}

export enum FieldsetOptionAside {
  // Fixed size.
  Fixed = "fixed",
  // Auto size.
  Auto = "auto"
}

// TYPES

export type FieldsetFieldDataInput = {
  value: FieldsetFieldDataInputValue;
  placeholder: string;
  initial?: string;
  disabled?: boolean;
};

type FieldsetFieldDataInputValue = {
  inner: string;
  change?: (_: string | number) => void;
};

export type FieldsetFieldDataTextarea = FieldsetFieldDataInput;

export type FieldsetFieldDataSelect = {
  value: FieldsetFieldDataSelectValue;
  options: Array<FormSelectOption>;
  placeholder: string;
  icon?: FormSelectIcon;
  position?: string;
  disabled?: boolean;
};

type FieldsetFieldDataSelectValue = {
  inner: string;
  change?: (_: string) => void;
};

export type FieldsetFieldDataCheckbox = {
  value: FieldsetFieldDataCheckboxValue;
  label?: string;
  disabled?: boolean;
};

type FieldsetFieldDataCheckboxValue = {
  inner: boolean;
  change?: (_: boolean) => void;
};

export type FieldsetFieldDataToggle = {
  value: FieldsetFieldDataToggleValue;
  disabled?: boolean;
};

type FieldsetFieldDataToggleValue = {
  inner: boolean;
  change?: (_: boolean) => void;
};

export type FieldsetFieldDataLevel = {
  value: FieldsetFieldDataLevelValue;
  disabled?: boolean;
};

type FieldsetFieldDataLevelValue = {
  inner: number;
};

export type FieldsetFieldDataStream = {
  value: FieldsetFieldDataStreamValue;
  disabled?: boolean;
};

type FieldsetFieldDataStreamValue = {
  inner: string;
};

export type FieldsetFieldDataButton = {
  text: string;
  tint?: string;
  reverse?: boolean;
  disabled?: boolean;
  click?: () => void;
};

export type FieldsetControlActionDataButton = FieldsetFieldDataButton;

// INTERFACES
export interface Fieldset {
  id: string;
  title: string;
  parts?: Array<FieldsetPart>;
  fields?: Array<FieldsetField>;
  controls?: Array<FieldsetControl>;
  notes?: Array<string>;
  options?: FieldsetOptions;
}

interface FieldsetPart {
  id: string;
  component: object;
  properties?: object;
  listeners?: object;
}

interface FieldsetField {
  id: string;
  type: FieldsetFieldType;
  label?: string;
  data?:
    | FieldsetFieldDataInput
    | FieldsetFieldDataTextarea
    | FieldsetFieldDataSelect
    | FieldsetFieldDataCheckbox
    | FieldsetFieldDataToggle
    | FieldsetFieldDataLevel
    | FieldsetFieldDataStream
    | FieldsetFieldDataButton;
  aside?: FieldsetFieldAside;
}

interface FieldsetFieldAside {
  type: FieldsetFieldAsideType;
  label: string;
  color?: string;
  icon?: string;
  disabled?: boolean;
  click?: () => void;
}

interface FieldsetControl {
  id: string;
  label: string;
  value: string;
  icon?: FieldsetControlIconType;
  actions?: Array<FieldsetControlAction>;
}

interface FieldsetControlAction {
  type: FieldsetControlActionType;
  data?: FieldsetControlActionDataButton;
}

interface FieldsetOptions {
  aside?: FieldsetOptionAside;
}

export default {
  name: "FormSettingsEditor",

  props: {
    fieldsets: {
      type: Array<Fieldset>,
      required: true,

      validator(x: Array<Fieldset>): boolean {
        return x.length > 0;
      }
    },

    fieldSize: {
      type: String,
      default: "mid-medium",

      validator(x: string) {
        return ["mid-medium", "large"].includes(x);
      }
    },

    fieldsetClass: {
      type: String,
      default: null
    },

    titleClass: {
      type: String,
      default: null
    },

    partClass: {
      type: String,
      default: null
    }
  },

  methods: {
    // --> HELPERS <--

    controlIconToName(icon: FieldsetControlIconType): string {
      switch (icon) {
        case FieldsetControlIconType.LocationActive:
        case FieldsetControlIconType.LocationInactive: {
          return "location.fill";
        }

        case FieldsetControlIconType.StatusEnabled:
        case FieldsetControlIconType.StatusDisabled: {
          return "circle.fill";
        }
      }
    },

    controlIconToColor(icon: FieldsetControlIconType): string {
      switch (icon) {
        case FieldsetControlIconType.LocationActive: {
          return "blue";
        }

        case FieldsetControlIconType.StatusEnabled: {
          return "green";
        }

        default: {
          return "grey";
        }
      }
    },

    controlIconToSize(icon: FieldsetControlIconType): string {
      switch (icon) {
        case FieldsetControlIconType.LocationActive:
        case FieldsetControlIconType.LocationInactive: {
          return "11px";
        }

        case FieldsetControlIconType.StatusEnabled:
        case FieldsetControlIconType.StatusDisabled: {
          return "9px";
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-settings-editor";

#{$c} {
  #{$c}__title {
    color: rgb(var(--color-text-secondary));
    font-size: ($font-size-baseline + 0.5px);
    margin-block-end: 16px;
  }

  #{$c}__field {
    #{$c}__field-spacer {
      height: 10px;
      display: block;
    }

    #{$c}__field-aside {
      margin-inline-start: 11px;
      margin-block-start: -3px;

      > * {
        font-size: ($font-size-baseline - 0.5px);
      }

      #{$c}__field-aside-link {
        color: rgb(var(--color-base-purple-normal));

        &:hover {
          text-decoration: underline;
        }

        &--disabled {
          pointer-events: none;
          opacity: 0.2;
        }
      }

      #{$c}__field-aside-label {
        display: flex;
        align-items: center;

        #{$c}__field-aside-icon {
          margin-inline-end: 2.5px;
          margin-block-end: -1px;
        }

        &--green {
          color: rgb(var(--color-base-green-normal));

          #{$c}__field-aside-icon {
            fill: rgb(var(--color-base-green-normal));
          }
        }
      }

      &--fixed {
        min-width: 120px;
      }

      &--auto {
        margin-inline-end: 10px;
      }
    }
  }

  #{$c}__controls {
    margin-block-start: 12px;

    #{$c}__control {
      #{$c}__control-icon {
        margin-block-start: 1px;
        margin-inline-end: 3px;

        &--grey {
          fill: rgb(var(--color-base-grey-normal));
        }

        &--blue {
          fill: rgb(var(--color-base-blue-dark));
        }

        &--green {
          fill: rgb(var(--color-base-green-normal));
        }
      }
    }
  }
}
</style>
