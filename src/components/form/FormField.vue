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
  v-click-away="onClickAway"
  :class=`[
    "c-form-field",
    "c-form-field--" + type,
    "c-form-field--" + size,
    "c-form-field--" + align,
    "c-form-field--" + direction,
    {
      "c-form-field--focused": isFocused,
      "c-form-field--disabled": disabled,
      "c-form-field--loading": loading
    }
  ]`
)
  textarea(
    v-if="type === 'textarea'"
    @keypress.stop
    @keydown.stop="onFieldKeyDown"
    @keyup.stop="onFieldKeyUp"
    @input="onFieldInput"
    @focus="onFieldFocus"
    @blur="onFieldBlur"
    @contextmenu.stop
    :name="name"
    :value="value"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :autocorrect="autocorrect"
    :autocapitalize="autocapitalize"
    :spellcheck="spellcheckString"
    :class=`[
      "c-form-field__inner",
      "c-form-field__inner--textarea",
      {
        [fieldClass]: fieldClass
      }
    ]`
    ref="field"
  )

  input(
    v-else
    @keypress.stop
    @keydown.stop="onFieldKeyDown"
    @keyup.stop="onFieldKeyUp"
    @input="onFieldInput"
    @focus="onFieldFocus"
    @blur="onFieldBlur"
    @contextmenu.stop
    :type="type"
    :name="name"
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :autocorrect="autocorrect"
    :autocapitalize="autocapitalize"
    :spellcheck="spellcheckString"
    :class=`[
      "c-form-field__inner",
      "c-form-field__inner--input",
      {
        [fieldClass]: fieldClass
      }
    ]`
    ref="field"
  )

  form-field-suggest(
    v-if="hasSuggestions"
    @select="onSuggestSelect"
    :size="size"
    :suggestions="suggestions"
    ref="suggest"
    class="c-form-field__suggest"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { codes as keyCodes } from "keycode";

// PROJECT: COMPONENTS
import {
  default as FormFieldSuggest,
  Suggestion as FormFieldSuggestSuggestion
} from "@/components/form/FormFieldSuggest.vue";

// INTERFACES
interface Selection {
  value: string;
  cursor?: SelectionCursor;
}

export interface SelectionCursor {
  text: string;
  start: number;
  end: number;
}

export default {
  name: "FormField",

  props: {
    modelValue: {
      type: [String, Number],
      default: null
    },

    type: {
      type: String,
      default: "text",
      required: true,

      validator(x: string) {
        return [
          "text",
          "password",
          "number",
          "email",
          "url",
          "textarea"
        ].includes(x);
      }
    },

    size: {
      type: String,
      default: "large",

      validator(x: string) {
        return [
          "medium",
          "mid-medium",
          "large",
          "mid-large",
          "ultra-large"
        ].includes(x);
      }
    },

    align: {
      type: String,
      default: "center",

      validator(x: string) {
        return ["left", "center", "right"].includes(x);
      }
    },

    direction: {
      type: String,
      default: "bottom",

      validator(x: string): boolean {
        return ["top", "bottom"].includes(x);
      }
    },

    name: {
      type: String,
      default: null
    },

    placeholder: {
      type: String,
      default: null
    },

    rows: {
      type: Number,
      default: 4
    },

    spellcheck: {
      type: Boolean,
      default: false
    },

    autocomplete: {
      type: String,
      default: null
    },

    autocorrect: {
      type: String,
      default: null
    },

    autocapitalize: {
      type: String,
      default: null
    },

    autogrow: {
      type: Boolean,
      default: false
    },

    submittable: {
      type: Boolean,
      default: false
    },

    autofocus: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    loading: {
      type: Boolean,
      default: false
    },

    suggestions: {
      type: Array<FormFieldSuggestSuggestion>,
      default: []
    },

    fieldClass: {
      type: String,
      default: null
    }
  },

  emits: [
    "update:modelValue",
    "keyup",
    "keystroke",
    "focus",
    "change",
    "submit",
    "refresh"
  ],

  data() {
    return {
      // --> STATE <--

      isFocused: false,
      areSuggestionsHidden: false,

      value: ""
    };
  },

  computed: {
    hasSuggestions(): boolean {
      return this.suggestions.length > 0 && this.areSuggestionsHidden !== true;
    },

    spellcheckString(): string {
      return this.spellcheck === true ? "true" : "false";
    }
  },

  watch: {
    modelValue: {
      immediate: true,

      handler(value) {
        // Update value in the state
        this.updateStateValue(value);
      }
    },

    suggestions() {
      // Ensure suggestions are not hidden (when they change)
      this.areSuggestionsHidden = false;
    }
  },

  mounted() {
    // Refresh auto-grow (if enabled)
    this.refreshAutogrow();

    // Apply auto-focus?
    // Notice: delay focus, otherwise the focus might not work in certain \
    //   circumstances.
    if (this.autofocus === true) {
      setTimeout(() => {
        this.focusField();
      });
    }
  },

  methods: {
    // --> EXTERNALS <--

    focusFieldFromParent(): void {
      // Alias focus field method
      this.focusField();
    },

    acquireFieldSelectionFromParent(): Selection | void {
      // Alias field selection method
      return this.acquireFieldSelection();
    },

    selectFieldRangeFromParent(start: number, end: number): void {
      // Alias field range method
      return this.selectFieldRange(start, end);
    },

    // --> HELPERS <--

    focusField(): void {
      // Attempt to focus? (not already focused)
      if (this.isFocused !== true) {
        const fieldElement = (this.$refs.field as HTMLElement) || null;

        if (fieldElement !== null) {
          fieldElement.focus();
        }
      }
    },

    acquireFieldSelection(): Selection | void {
      const fieldElement = (this.$refs.field as HTMLInputElement) || null;

      if (fieldElement !== null) {
        // Acquire value from field
        const fieldValue = fieldElement.value;

        // Populate selection object
        const selection: Selection = {
          value: fieldValue
        };

        // Obtain the indexes of the selected characters (start and end)
        const cursorStart = fieldElement.selectionStart,
          cursorEnd = fieldElement.selectionEnd;

        if (cursorStart !== null) {
          selection.cursor = {
            text:
              cursorEnd !== null
                ? fieldElement.value.substring(cursorStart, cursorEnd)
                : "",

            start: cursorStart,
            end: cursorEnd !== null ? cursorEnd : cursorStart
          };
        }

        return selection;
      }

      return undefined;
    },

    selectFieldRange(start: number, end: number): void {
      const fieldElement = (this.$refs.field as HTMLInputElement) || null;

      if (fieldElement !== null) {
        fieldElement.setSelectionRange(start, end);
      }
    },

    updateStateValue(value: string): void {
      this.value = value;

      // Refresh auto-grow (if enabled)
      this.$nextTick(this.refreshAutogrow);
    },

    updateModelValue(value: string | number): void {
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
    },

    refreshAutogrow(): void {
      if (this.autogrow === true) {
        const fieldElement = (this.$refs.field as HTMLElement) || null;

        if (fieldElement !== null) {
          // Reset height to default (so that later measured scroll height \
          //   reports its real value)
          fieldElement.style.height = "auto";

          // Assign new field height
          fieldElement.style.height = `${fieldElement.scrollHeight}px`;

          // Trigger resize event? (height changed)
          this.$emit("refresh");
        }
      }
    },

    selectActiveSuggestion(): void {
      // Select active suggestion
      (this.$refs.suggest as typeof FormFieldSuggest)?.selectFromParent();
    },

    navigateSuggestions(increment: number): void {
      // Navigate forwards or backwards in suggestions
      (this.$refs.suggest as typeof FormFieldSuggest)?.navigateFromParent(
        increment
      );
    },

    clearAllSuggestions(): void {
      // Hide suggestions
      this.areSuggestionsHidden = true;
    },

    generateSuggestionModelValue(
      suggestion: FormFieldSuggestSuggestion
    ): string {
      // Append suggestion value
      const modelValueString = this.modelValue as string,
        modelValueLower = modelValueString.toLowerCase(),
        matchLower = suggestion.action.match.toLowerCase();

      // Acquire intersection size
      const intersectSize =
        modelValueLower.endsWith(matchLower) === true
          ? suggestion.action.match.length
          : 0;

      // Merge suggestion value with existing model value (intersect them)
      return (
        modelValueString.substring(0, modelValueString.length - intersectSize) +
        suggestion.action.replacement
      );
    },

    // --> EVENT LISTENERS <--

    onClickAway(): void {
      // Clear suggestions?
      if (this.hasSuggestions === true) {
        this.clearAllSuggestions();
      }
    },

    onFieldKeyDown(event: KeyboardEvent): void {
      const keyCode = event.keyCode;

      switch (keyCode) {
        // Enter
        case keyCodes.enter: {
          if (this.hasSuggestions === true) {
            event.preventDefault();

            // Select active suggestion
            this.selectActiveSuggestion();
          } else {
            // Handle 'Enter' key press? (if not new line and submittable field)
            if (event.shiftKey !== true && this.submittable === true) {
              event.preventDefault();

              // Trigger field submit event
              this.$emit("submit");
            }
          }

          break;
        }

        // Escape
        case keyCodes.esc: {
          if (this.hasSuggestions === true) {
            event.preventDefault();

            // Hide suggestions
            this.clearAllSuggestions();
          }

          break;
        }

        // Down + Up
        case keyCodes.down:
        case keyCodes.up: {
          if (this.hasSuggestions === true) {
            event.preventDefault();

            // Navigate in suggestions
            this.navigateSuggestions(keyCode === keyCodes.up ? -1 : 1);
          }

          break;
        }
      }
    },

    onFieldKeyUp(event: KeyboardEvent): void {
      const inputElement = event.target as HTMLInputElement | void;

      // Handle key event
      const keyCode = event.keyCode;

      switch (keyCode) {
        // Escape
        case keyCodes.esc: {
          // De-focus from input
          inputElement?.blur();

          break;
        }
      }

      // Propagate key events
      this.$emit("keyup", event);
      this.$emit("keystroke", inputElement?.value || "");
    },

    onFieldInput(): void {
      let inputValue: string | number =
        (this.$refs.field as HTMLInputElement).value || "";

      // Convert raw input value to number?
      if (inputValue && this.type === "number") {
        inputValue = Number(inputValue);
      }

      // Update model value and send change event
      this.updateModelValue(inputValue);
    },

    onFieldFocus(): void {
      this.isFocused = true;

      // Propagate focus event
      this.$emit("focus", true);
    },

    onFieldBlur(): void {
      this.isFocused = false;

      // Propagate focus event
      this.$emit("focus", false);
    },

    onSuggestSelect(suggestion: FormFieldSuggestSuggestion): void {
      this.clearAllSuggestions();

      // Generate model value for selected suggestion
      let updatedModelValue = this.generateSuggestionModelValue(suggestion);

      // Update model value
      this.updateModelValue(updatedModelValue);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-field";

#{$c} {
  position: relative;

  #{$c}__inner {
    background-color: rgb(var(--color-white));
    border: 1px solid rgba(var(--color-black), 0.1);
    outline: 0 solid rgba(var(--color-base-purple-normal), 0);
    color: rgb(var(--color-text-primary));
    font-family: inherit;
    width: 100%;
    padding-block: $size-form-field-padding-block;
    transition-property: box-shadow, border-color, outline-color, outline-width;
    transition-duration: 150ms;
    transition-timing-function: linear;
    border-radius: $size-form-field-border-radius;
    box-sizing: border-box;
    box-shadow: 0 3px 4px 0 rgba(var(--color-shadow-primary), 0.01),
      inset 0 1px 2px 0 rgba(var(--color-black), 0.04);

    &--textarea {
      height: 100%;
      margin: 0;
      resize: none;
      display: block;
    }

    &::placeholder {
      color: rgb(var(--color-text-secondary));
      opacity: 1;
    }

    &:hover {
      border-color: rgba(var(--color-base-purple-normal), 0.5);
    }

    &:focus {
      border-color: rgb(var(--color-base-purple-normal));
      box-shadow: 0 3px 4px 0 rgba(var(--color-shadow-primary), 0.1),
        inset 0 1px 2px 0 rgba(var(--color-black), 0.04);
    }
  }

  #{$c}__suggest {
    max-height: 160px;
    position: absolute;
    inset-inline: 0;
    z-index: 1;
  }

  // --> TYPES <--

  &--input {
    display: inline-block;
  }

  &--textarea {
    display: block;
  }

  // --> SIZES <--

  &--medium {
    #{$c}__inner {
      font-size: ($font-size-baseline - 3px);
      letter-spacing: 0.05px;
      padding-inline-start: $size-form-field-medium-padding-sides;
      padding-inline-end: $size-form-field-medium-padding-sides;

      &--input {
        line-height: $size-form-field-medium-input-line-height;
      }

      &--textarea {
        line-height: $size-form-field-medium-textarea-line-height;
        padding-block: $size-form-field-medium-textarea-padding-block;
      }
    }
  }

  &--mid-medium {
    #{$c}__inner {
      font-size: ($font-size-baseline - 1px);
      letter-spacing: 0.075px;
      padding-inline-start: $size-form-field-mid-medium-padding-sides;
      padding-inline-end: $size-form-field-mid-medium-padding-sides;

      &--input {
        line-height: $size-form-field-mid-medium-input-line-height;
      }

      &--textarea {
        line-height: $size-form-field-mid-medium-textarea-line-height;
        padding-block: $size-form-field-mid-medium-textarea-padding-block;
      }
    }
  }

  &--large {
    #{$c}__inner {
      font-size: $font-size-baseline;
      letter-spacing: 0.1px;
      padding-inline-start: $size-form-field-large-padding-sides;
      padding-inline-end: $size-form-field-large-padding-sides;

      &--input {
        line-height: $size-form-field-large-input-line-height;
      }

      &--textarea {
        line-height: $size-form-field-large-textarea-line-height;
        padding-block: $size-form-field-large-textarea-padding-block;
      }
    }
  }

  &--mid-large {
    #{$c}__inner {
      font-size: ($font-size-baseline + 2px);
      letter-spacing: 0.125px;
      padding-inline-start: $size-form-field-mid-large-padding-sides;
      padding-inline-end: $size-form-field-mid-large-padding-sides;

      &--input {
        line-height: $size-form-field-mid-large-input-line-height;
      }

      &--textarea {
        line-height: $size-form-field-mid-large-textarea-line-height;
        padding-block: $size-form-field-mid-large-textarea-padding-block;
      }
    }
  }

  &--ultra-large {
    #{$c}__inner {
      font-size: ($font-size-baseline + 3px);
      letter-spacing: 0.15px;
      padding-inline-start: $size-form-field-ultra-large-padding-sides;
      padding-inline-end: $size-form-field-ultra-large-padding-sides;

      &--input {
        line-height: $size-form-field-ultra-large-input-line-height;
      }

      &--textarea {
        line-height: $size-form-field-ultra-large-textarea-line-height;
        padding-block: $size-form-field-ultra-large-textarea-padding-block;
      }
    }
  }

  // --> ALIGNS <--

  &--left {
    #{$c}__inner {
      text-align: left;
    }
  }

  &--center {
    #{$c}__inner {
      text-align: center;
    }
  }

  &--right {
    #{$c}__inner {
      text-align: right;
    }
  }

  // --> DIRECTIONS <--

  &--top {
    #{$c}__suggest {
      inset-block-end: calc(
        100% + #{$size-form-field-suggest-block-origin-offset}
      );
    }
  }

  &--bottom {
    #{$c}__suggest {
      inset-block-start: calc(
        100% + #{$size-form-field-suggest-block-origin-offset}
      );
    }
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }

    #{$c}__inner {
      background-color: rgba(var(--color-base-grey-light), 0.6);
      color: rgb(var(--color-text-secondary));
      pointer-events: none;

      &::placeholder {
        color: rgb(var(--color-text-tertiary));
      }
    }
  }

  &--focused {
    #{$c}__inner {
      outline-color: rgba(var(--color-base-purple-normal), 0.2);
      outline-width: $size-form-field-outline-width;
    }
  }
}
</style>
