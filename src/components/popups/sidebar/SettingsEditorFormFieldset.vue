<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-settings-editor-form-fieldset
  form-fieldset.p-settings-editor-form-fieldset__fieldset(
    v-for="fieldset in fieldsets"
    :id="'fieldset_' + fieldset.id"
  )
    h6.p-settings-editor-form-fieldset__title.u-medium
      | {{ fieldset.title }}

    template(
      v-if="fieldset.parts"
    )
      component(
        v-for="part in fieldset.parts"
        v-bind="part.properties"
        :is="part.component"
      )

    template(
      v-if="fieldset.fields"
    )
      form-fieldset-field(
        v-for="field in fieldset.fields"
        :label="field.label || ''"
        class="p-settings-editor-form-fieldset__field"
      )
        template(
          v-slot:default
        )
          form-field(
            v-if="field.type === 'input'"
            v-model="field.data.value.inner"
            @change="field.data.value.change"
            :name="field.id"
            :placeholder="field.data.placeholder"
            :disabled="field.data.disabled"
            type="text"
            size="mid-medium"
            align="left"
          )

          form-select(
            v-else-if="field.type === 'select'"
            v-model="field.data.value.inner"
            @change="field.data.value.change"
            :options="field.data.options"
            :icon="field.data.icon"
            :name="field.id"
            :placeholder="field.data.placeholder"
            :position="field.data.position"
            :search="field.data.options.length > 10"
            :disabled="field.data.disabled"
            size="mid-medium"
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
            :disabled="field.data.disabled"
            tint="light"
            size="mid-medium"
          )
            | {{ field.data.text }}

          span.p-settings-editor-form-fieldset__field-spacer(
            v-else-if="field.type === 'spacer'"
          )

        template(
          v-slot:aside
        )
          .p-settings-editor-form-fieldset__field-aside(
            v-if="fieldset.options && fieldset.options.aside === true"
          )
            template(
              v-if="field.aside"
            )
              a(
                v-if="field.aside.type === 'link'"
                :class=`[
                  "p-settings-editor-form-fieldset__field-aside-link",
                  "u-medium",
                  {
                    "p-settings-editor-form-fieldset__field-aside-link--disabled": field.aside.disabled
                  }
                ]`
              )
                | {{ field.aside.label }}

              span(
                v-else-if="field.aside.type === 'label'"
                :class=`[
                  "p-settings-editor-form-fieldset__field-aside-label",
                  {
                    ["p-settings-editor-form-fieldset__field-aside-label--" + field.aside.color]: field.aside.color
                  }
                ]`
              )
                base-icon(
                  v-if="field.aside.icon"
                  :name="field.aside.icon"
                  size="13px"
                  class="p-settings-editor-form-fieldset__field-aside-icon"
                )

                | {{ field.aside.label }}

    .p-settings-editor-form-fieldset__controls(
      v-if="fieldset.controls"
    )
      form-fieldset-control(
        v-for="control in fieldset.controls"
        :label="control.label"
        class="p-settings-editor-form-fieldset__control"
      )
        template(
          v-slot:default
        )
          base-icon(
            v-if="control.icon"
            :name="controlIconToName(control.icon)"
            :size="controlIconToSize(control.icon)"
            :class=`[
              "p-settings-editor-form-fieldset__control-icon",
              "p-settings-editor-form-fieldset__control-icon--" + controlIconToColor(control.icon)
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

// TYPES

export type FieldsetFieldDataInput = {
  value: FieldsetFieldDataInputValue;
  placeholder: string;
  disabled?: boolean;
};

type FieldsetFieldDataInputValue = {
  inner: string;
  change?: (_: string | number) => void;
};

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
  disabled?: boolean;
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
}

interface FieldsetField {
  id: string;
  type: FieldsetFieldType;
  label?: string;
  data?:
    | FieldsetFieldDataInput
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
  aside?: boolean;
}

export default {
  name: "SettingsEditorFormFieldset",

  props: {
    fieldsets: {
      type: Array<Fieldset>,
      required: true,

      validator(x: Array<Fieldset>): boolean {
        return x.length > 0;
      }
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
$c: ".p-settings-editor-form-fieldset";

.p-settings-editor-form-fieldset {
  #{$c}__title {
    color: rgb(var(--color-text-secondary));
    font-size: 14.5px;
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
      min-width: 120px;

      > * {
        font-size: 13.5px;
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
