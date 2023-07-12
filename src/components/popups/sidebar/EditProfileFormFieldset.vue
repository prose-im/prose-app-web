<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-form-fieldset
  form-fieldset.p-edit-profile-form-fieldset__fieldset(
    v-for="fieldset in fieldsets"
    :id="'fieldset_' + fieldset.id"
  )
    h6.p-edit-profile-form-fieldset__title.u-medium
      | {{ fieldset.title }}

    form-fieldset-field(
      v-for="field in fieldset.fields"
      :label="field.label"
      class="p-edit-profile-form-fieldset__field"
    )
      template(
        v-slot:default
      )
        form-field(
          v-if="field.type === 'input'"
          v-model="field.data.value"
          :name="field.id"
          :placeholder="field.data.placeholder"
          type="text"
          size="mid-medium"
          align="left"
        )

        form-toggle(
          v-else-if="field.type === 'toggle'"
          v-model="field.data.value"
          :name="field.id"
        )

        base-button(
          v-else-if="field.type === 'button'",
          :disabled="field.data.disabled"
          tint="light"
          size="mid-medium"
        )
          | {{ field.data.text }}

      template(
        v-slot:aside
      )
        .p-edit-profile-form-fieldset__field-aside
          template(
            v-if="field.aside"
          )
            a.p-edit-profile-form-fieldset__field-aside-link.u-medium(
              v-if="field.aside.type === 'link'"
            )
              | {{ field.aside.label }}

            span(
              v-else-if="field.aside.type === 'label'"
              :class=`[
                "p-edit-profile-form-fieldset__field-aside-label",
                {
                  ["p-edit-profile-form-fieldset__field-aside-label--" + field.aside.color]: field.aside.color
                }
              ]`
            )
              base-icon(
                v-if="field.aside.icon"
                :name="field.aside.icon"
                size="13px"
                class="p-edit-profile-form-fieldset__field-aside-icon"
              )

              | {{ field.aside.label }}

    .p-edit-profile-form-fieldset__controls(
      v-if="fieldset.controls"
    )
      form-fieldset-control(
        v-for="control in fieldset.controls"
        :label="control.label"
        class="p-edit-profile-form-fieldset__control"
      )
        template(
          v-slot:default
        )
          base-icon(
            v-if="control.icon"
            :name="controlIconToName(control.icon)"
            :class=`[
              "p-edit-profile-form-fieldset__control-icon",
              ("p-edit-profile-form-fieldset__control-icon--" + controlIconToColor(control.icon))
            ]`
            size="11px"
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
// ENUMERATIONS
export enum FieldsetFieldType {
  // Input type.
  Input = "input",
  // Toggle type.
  Toggle = "toggle",
  // Button type.
  Button = "button"
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
  LocationInactive = "location-inactive"
}

// TYPES

export type FieldsetFieldDataInput = {
  value: string;
  placeholder: string;
};

export type FieldsetFieldDataToggle = {
  value: boolean;
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
  fields: Array<FieldsetField>;
  controls?: Array<FieldsetControl>;
  notes?: Array<string>;
}

interface FieldsetField {
  id: string;
  type: FieldsetFieldType;
  label: string;
  data?:
    | FieldsetFieldDataInput
    | FieldsetFieldDataToggle
    | FieldsetFieldDataButton;
  aside?: FieldsetFieldAside;
}

interface FieldsetFieldAside {
  type: FieldsetFieldAsideType;
  label: string;
  color?: string;
  icon?: string;
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

export default {
  name: "EditProfileFormFieldset",

  props: {
    fieldsets: {
      type: Array,
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
      }
    },

    controlIconToColor(icon: FieldsetControlIconType): string {
      switch (icon) {
        case FieldsetControlIconType.LocationActive: {
          return "blue";
        }

        default: {
          return "grey";
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
$c: ".p-edit-profile-form-fieldset";

.p-edit-profile-form-fieldset {
  #{$c}__title {
    color: $color-text-secondary;
    font-size: 14.5px;
    margin-block-end: 16px;
  }

  #{$c}__field {
    #{$c}__field-aside {
      margin-inline-start: 11px;
      margin-block-start: -3px;
      min-width: 120px;

      > * {
        font-size: 13.5px;
      }

      #{$c}__field-aside-link {
        color: $color-base-purple-normal;

        &:hover {
          text-decoration: underline;
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
          color: $color-base-green-normal;

          #{$c}__field-aside-icon {
            fill: $color-base-green-normal;
          }
        }
      }
    }
  }

  #{$c}__controls {
    margin-block-start: 12px;

    #{$c}__control {
      #{$c}__control-icon {
        margin-inline-end: 2px;

        &--grey {
          fill: $color-base-grey-normal;
        }

        &--blue {
          fill: $color-base-blue-dark;
        }

        &--green {
          fill: $color-base-green-normal;
        }
      }
    }
  }
}
</style>
