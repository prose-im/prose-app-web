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

// TYPES

type FieldsetFieldDataInput = {
  value: string;
  placeholder: string;
};

type FieldsetFieldDataToggle = {
  value: boolean;
};

type FieldsetFieldDataButton = {
  text: string;
};

// INTERFACES
export interface Fieldset {
  id: string;
  title: string;
  fields: Array<FieldsetField>;
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
}
</style>
