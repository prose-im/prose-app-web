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
    "c-form-select",
    "c-form-select--" + size,
    "c-form-select--" + align,
    "c-form-select--" + position,
    {
      "c-form-select--visible": visible && !disabled,
      "c-form-select--search": search,
      "c-form-select--disabled": disabled,
      "c-form-select--loading": loading
    }
  ]`
)
  input(
    @change="onInputChange"
    :name="name"
    :value="value"
    type="text"
    ref="input"
    class="c-form-select__input"
  )

  .c-form-select__field(
    @click="onFieldClick"
  )
    .c-form-select__inner
      component(
        v-if="icon && value"
        v-bind="icon.properties(value)"
        :is="icon.component"
        class="c-form-select__icon"
      )

      span(
        :class=`[
          "c-form-select__value",
          "u-ellipsis",
          {
            "c-form-select__value--empty": !value
          }
        ]`
      )
        | {{ valueLabel || placeholder || "" }}

      base-icon(
        :size="arrowSize"
        name="chevron.up"
        class="c-form-select__arrow"
      )

  .c-form-select__dropdown(
    v-if="visible && !disabled"
    v-click-away="onDropdownClickAway"
    v-hotkey="hotkeys"
  )
    .c-form-select__search(
      v-if="search"
    )
      base-icon(
        name="magnifyingglass"
        size="11px"
        class="c-form-select__search-icon"
      )

      input(
        v-model.trim="searchQuery"
        @keydown="onSearchInputKeyDown"
        :name="name ? (name + '_search') : null"
        :disabled="disabled"
        :class=`[
          {
            "u-medium": searchQuery
          }
        ]`
        type="search"
        placeholder="Search…"
        ref="search"
      )

    ul.c-form-select__options(
      ref="options"
    )
      li(
        v-for="(option, index) in filteredOptions"
        @mouseenter="onOptionMouseEnter(index)"
        :class=`[
          "c-form-select__option",
          {
            "u-medium": (value === option.value),
            "c-form-select__option--selected": (value === option.value),
            "c-form-select__option--hovered": (hoveredIndex === index)
          }
        ]`
      )
        a(
          @click="onOptionClick(option)"
        )
          component(
            v-if="icon"
            v-bind="icon.properties(option.value)"
            :is="icon.component"
            class="c-form-select__icon"
          )

          span.c-form-select__value.u-ellipsis
            | {{ option.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { names as keyNames } from "keycode";

// INTERFACES
export interface Option {
  value: string;
  label: string;
}

// CONSTANTS
const AVAILABLE_SIZES: { [size: string]: { arrow: string } } = {
  medium: {
    arrow: "6px"
  },

  "mid-medium": {
    arrow: "8px"
  },

  large: {
    arrow: "9px"
  },

  "mid-large": {
    arrow: "9px"
  },

  "ultra-large": {
    arrow: "10px"
  }
};

const SEARCH_QUERY_PREFIX_LENGTH_MAXIMUM = 2;

export interface Icon {
  component: object;
  properties: (value: string) => object;
}

export default {
  name: "FormSelect",

  props: {
    modelValue: {
      type: String,
      default: null
    },

    options: {
      type: Array<Option>,
      required: true,

      validator(x: Array<Option>): boolean {
        return x.length > 0;
      }
    },

    name: {
      type: String,
      default: null
    },

    icon: {
      type: Object as PropType<Icon>,
      default: null
    },

    size: {
      type: String,
      default: "large",

      validator(x: string) {
        return Object.keys(AVAILABLE_SIZES).includes(x);
      }
    },

    align: {
      type: String,
      default: "left",

      validator(x: string) {
        return ["left", "center"].includes(x);
      }
    },

    position: {
      type: String,
      default: "top",

      validator(x: string) {
        return ["top", "bottom"].includes(x);
      }
    },

    placeholder: {
      type: String,
      default: null
    },

    disabled: {
      type: Boolean,
      default: false
    },

    loading: {
      type: Boolean,
      default: false
    },

    search: {
      type: Boolean,
      default: true
    }
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      // --> STATE <--

      value: "",
      searchQuery: "",

      hoveredIndex: -1,

      visible: false
    };
  },

  computed: {
    filteredOptions(): Array<Option> {
      // Any search query? Filter options.
      if (this.search === true && this.searchQuery) {
        const searchQueryLower = this.searchQuery.toLowerCase();

        return this.options.filter(option => {
          const optionLabelLower = option.label.toLowerCase();

          // Perform prefix search, or include search?
          if (searchQueryLower.length <= SEARCH_QUERY_PREFIX_LENGTH_MAXIMUM) {
            return optionLabelLower.startsWith(searchQueryLower);
          }

          return optionLabelLower.includes(searchQueryLower);
        });
      }

      // No search query, return identity.
      return this.options;
    },

    hasOptions(): boolean {
      return this.filteredOptions.length > 0;
    },

    valueLabel(): string {
      const option = this.options.find(option => {
        return this.value === option.value;
      });

      // Return inner label from corresponding option?
      if (option && option.label) {
        return option.label;
      }

      // Fallback on raw value
      return this.value;
    },

    arrowSize(): string {
      const sizeProperties = AVAILABLE_SIZES[this.size];

      // Return arrow size for select size?
      if (sizeProperties) {
        return sizeProperties.arrow;
      }

      // Return fallback size
      return "10px";
    },

    hotkeys(): { [name: string]: (event: Event) => void } {
      return {
        enter: this.onHotkeyEnter,
        esc: this.onHotkeyEscape,
        down: this.onHotkeyDown,
        up: this.onHotkeyUp
      };
    }
  },

  watch: {
    modelValue: {
      immediate: true,

      handler(value) {
        this.value = value;
      }
    },

    searchQuery: {
      handler(value) {
        // Reset hovered index (as search query changed)
        this.hoveredIndex = value ? 0 : -1;
      }
    },

    visible: {
      handler(value) {
        // Now invisible? Reset values (as needed)
        if (value === false) {
          if (this.hoveredIndex >= 0) {
            this.hoveredIndex = -1;
          }

          if (this.searchQuery) {
            this.searchQuery = "";
          }
        }
      }
    }
  },

  mounted() {
    // Apply focus on search input (as needed)
    this.autoFocusDropdownSearch();
  },

  methods: {
    // --> HELPERS <--

    selectOption(option: Option): void {
      const inputElement = this.$refs.input as HTMLInputElement;

      // Assign new value, and dispatch change event
      inputElement.value = option.value;

      inputElement.dispatchEvent(new Event("change"));

      // Hide dropdown selector
      this.hideDropdown();
    },

    hideDropdown(): void {
      this.visible = false;
    },

    autoFocusDropdownSearch(): void {
      // Apply auto-focus?
      if (this.search === true && this.visible === true) {
        const searchElement = (this.$refs.search as HTMLElement) || null;

        if (searchElement !== null) {
          searchElement.focus();
        }
      }
    },

    scrollToOptionIndex(index: number): void {
      const optionsElement = (this.$refs.options as HTMLElement) || null;

      if (optionsElement !== null) {
        const optionElement = optionsElement.children[index] || null;

        if (optionElement !== null) {
          optionElement.scrollIntoView({
            behavior: "auto",
            block: "nearest"
          });
        }
      }
    },

    eventOverrides(event: Event): void {
      event.stopPropagation();
      event.preventDefault();
    },

    // --> EVENT LISTENERS <--

    onHotkeyEnter(event: Event): void {
      this.eventOverrides(event);

      if (this.hasOptions === true && this.hoveredIndex >= 0) {
        const selectedOption = this.filteredOptions[this.hoveredIndex] || null;

        if (selectedOption !== null) {
          this.selectOption(selectedOption);
        }
      }
    },

    onHotkeyEscape(event: Event): void {
      this.eventOverrides(event);

      // Stepped escape handling (1st hit resets search, 2nd hit closes)
      if (this.searchQuery) {
        // Reset search query
        this.searchQuery = "";
      } else {
        // Hide dropdown selector
        this.hideDropdown();
      }
    },

    onHotkeyDown(event: Event): void {
      this.eventOverrides(event);

      if (this.hasOptions === true) {
        const nextHoveredIndex = this.hoveredIndex + 1;

        if (nextHoveredIndex < this.filteredOptions.length) {
          this.hoveredIndex = nextHoveredIndex;
        } else {
          this.hoveredIndex = 0;
        }

        this.scrollToOptionIndex(this.hoveredIndex);
      }
    },

    onHotkeyUp(event: Event): void {
      this.eventOverrides(event);

      if (this.hasOptions === true) {
        const previousHoveredIndex = this.hoveredIndex - 1;

        if (previousHoveredIndex >= 0) {
          this.hoveredIndex = previousHoveredIndex;
        } else {
          this.hoveredIndex = this.filteredOptions.length - 1;
        }

        this.scrollToOptionIndex(this.hoveredIndex);
      }
    },

    onFieldClick(): void {
      // Toggle dropdown visibility
      this.visible = !this.visible;

      // Apply focus on search input (as needed)
      this.$nextTick(this.autoFocusDropdownSearch);
    },

    onDropdownClickAway(): void {
      // Hide dropdown
      this.hideDropdown();
    },

    onSearchInputKeyDown(event: KeyboardEvent): void {
      const keyName = keyNames[event.keyCode] || null;

      if (keyName !== null) {
        // Re-trigger hotkey handler function? (if any)
        const handlerFn = this.hotkeys[keyName] || null;

        if (handlerFn !== null) {
          handlerFn(event);
        }
      }
    },

    onOptionMouseEnter(index: number): void {
      if (this.hoveredIndex !== index) {
        this.hoveredIndex = index;
      }
    },

    onOptionClick(option: Option): void {
      this.selectOption(option);
    },

    onInputChange(event: Event): void {
      // Update model value?
      if (event.target) {
        const selectValue: string = (event.target as HTMLInputElement).value;

        // Update model value and send change event
        this.$emit("update:modelValue", selectValue);
        this.$emit("change", selectValue);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-select";

// VARIABLES
$sizes: (
  "medium": (
    "font-size": 11.5px,
    "line-height": $size-form-select-medium-line-height,
    "padding-sides": $size-form-select-medium-padding-sides,
    "option-retract": 2px
  ),

  "mid-medium": (
    "font-size": 12.5px,
    "line-height": $size-form-select-mid-medium-line-height,
    "padding-sides": $size-form-select-mid-medium-padding-sides,
    "option-retract": 4px
  ),

  "large": (
    "font-size": 14.5px,
    "line-height": $size-form-select-large-line-height,
    "padding-sides": $size-form-select-large-padding-sides,
    "option-retract": 6px
  ),

  "mid-large": (
    "font-size": 15.5px,
    "line-height": $size-form-select-mid-large-line-height,
    "padding-sides": $size-form-select-mid-large-padding-sides,
    "option-retract": 8px
  ),

  "ultra-large": (
    "font-size": 16.5px,
    "line-height": $size-form-select-ultra-large-line-height,
    "padding-sides": $size-form-select-ultra-large-padding-sides,
    "option-retract": 10px
  )
);

.c-form-select {
  position: relative;

  #{$c}__field,
  #{$c}__dropdown {
    background-color: rgb(var(--color-white));
    border: $size-form-select-border-width solid rgba(var(--color-black), 0.1);
    box-shadow: 0 2px 3px 0 rgba(var(--color-shadow-primary), 0.01);
  }

  #{$c}__field,
  #{$c}__options #{$c}__option {
    #{$c}__icon {
      margin-inline-end: 9px;
      flex: 0 0 auto;
    }

    #{$c}__value {
      flex: 1;
    }
  }

  #{$c}__input {
    display: none;
  }

  #{$c}__field {
    width: calc(100% - (2 * $size-form-select-border-width));
    padding-block: $size-form-select-padding-block;
    transition: border-color 150ms linear;
    border-radius: $size-form-select-border-radius;
    cursor: pointer;
    position: relative;

    &:hover {
      border-color: rgba(var(--color-black), 0.15);
    }

    &:active {
      border-color: rgba(var(--color-black), 0.2);
    }

    #{$c}__inner {
      display: flex;
      align-items: center;
    }

    #{$c}__value {
      color: rgb(var(--color-text-primary));

      &--empty {
        color: rgb(var(--color-text-secondary));
      }
    }

    #{$c}__arrow {
      fill: rgb(var(--color-text-tertiary));
      margin-inline-start: 5px;
      flex: 0 0 auto;
    }
  }

  #{$c}__dropdown {
    overflow: hidden;
    position: absolute;
    inset-inline: 0;
  }

  #{$c}__search {
    background-color: rgba(var(--color-background-primary), 0.94);
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    backdrop-filter: blur(8px);

    &,
    input {
      height: $size-form-select-search-height;
    }

    #{$c}__search-icon {
      fill: rgb(var(--color-base-grey-normal));
      pointer-events: none;
      position: absolute;
      inset-block-start: 50%;
      transform: translateY(-50%);
    }

    input {
      background-color: transparent;
      border: 0 none;
      border-block-end: 1px solid rgb(var(--color-border-tertiary));
      color: rgb(var(--color-text-primary));
      outline: 0 none;
      font-size: 11px;
      letter-spacing: 0.05px;
      width: 100%;

      &::placeholder {
        color: rgb(var(--color-text-tertiary));
        opacity: 1;
      }
    }
  }

  #{$c}__options {
    max-height: 240px;
    padding-block: $size-form-select-options-padding-block;
    overflow-x: hidden;
    overflow-y: auto;

    #{$c}__option {
      display: block;

      a {
        background-color: transparent;
        display: flex;
        align-items: center;
        transition: none;

        #{$c}__value {
          color: rgb(var(--color-text-primary));
        }
      }

      &--hovered {
        a {
          background-color: rgb(var(--color-base-purple-normal));

          &,
          &:active {
            #{$c}__value {
              color: rgb(var(--color-text-reverse));
            }
          }

          &:active {
            background-color: darken-var(var(--color-base-purple-normal), 8%);
          }
        }
      }

      &--selected {
        a {
          background-color: darken-var(var(--color-background-secondary), 3%);
        }

        &#{$c}__option--hovered {
          a {
            background-color: darken-var(var(--color-background-secondary), 8%);

            &,
            &:active {
              #{$c}__value {
                color: rgb(var(--color-text-primary));
              }
            }

            &:active {
              background-color: darken-var(
                var(--color-background-secondary),
                10%
              );
            }
          }
        }
      }
    }
  }

  // --> SIZES <--

  @each $name, $size in $sizes {
    &--#{$name} {
      #{$c}__field,
      #{$c}__options {
        font-size: map-get($size, "font-size");
      }

      #{$c}__field #{$c}__inner,
      #{$c}__options #{$c}__option a {
        padding-inline-start: map-get($size, "padding-sides");
        padding-inline-end: map-get($size, "padding-sides");
      }

      #{$c}__field {
        #{$c}__value {
          line-height: map-get($size, "line-height");
        }
      }

      #{$c}__search {
        #{$c}__search-icon {
          inset-inline-start: map-get($size, "padding-sides");
        }

        input {
          padding-inline-start: (
            map-get($size, "padding-sides") +
              $size-form-select-search-icon-offset
          );
          padding-inline-end: map-get($size, "padding-sides");
        }
      }

      #{$c}__options {
        #{$c}__option {
          line-height: (
            map-get($size, "line-height") - map-get($size, "option-retract")
          );
        }
      }
    }
  }

  // --> ALIGNS <--

  &--left {
    #{$c}__field #{$c}__inner,
    #{$c}__search input,
    #{$c}__options #{$c}__option a {
      text-align: left;
    }
  }

  &--center {
    #{$c}__field #{$c}__inner,
    #{$c}__search input,
    #{$c}__options #{$c}__option a {
      text-align: center;
    }
  }

  // --> POSITIONS <--

  &--top {
    #{$c}__field {
      z-index: 2;
    }

    #{$c}__dropdown {
      border-block-end: 0 none;
      inset-block-end: 100%;
      z-index: 1;
      border-start-start-radius: $size-form-select-border-radius;
      border-start-end-radius: $size-form-select-border-radius;
    }

    &#{$c}--visible {
      #{$c}__field {
        border-start-start-radius: 0;
        border-start-end-radius: 0;
      }
    }
  }

  &--bottom {
    #{$c}__field {
      z-index: 1;
    }

    #{$c}__dropdown {
      border-block-start: 0 none;
      inset-block-start: 100%;
      z-index: 2;
      border-end-start-radius: $size-form-select-border-radius;
      border-end-end-radius: $size-form-select-border-radius;
    }

    &#{$c}--visible {
      #{$c}__field {
        border-end-start-radius: 0;
        border-end-end-radius: 0;
      }
    }
  }

  // --> BOOLEANS <--

  &--visible {
    #{$c}__field,
    #{$c}__dropdown {
      &,
      &:hover,
      &:active {
        border-color: rgba(var(--color-black), 0.125);
      }
    }

    #{$c}__field {
      #{$c}__arrow {
        transform: scaleY(-1);
      }
    }
  }

  &--search {
    #{$c}__options {
      padding-block-start: (
        $size-form-select-search-height +
          $size-form-select-options-padding-block
      );
    }
  }

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }

    #{$c}__field,
    #{$c}__dropdown {
      pointer-events: none;
    }

    #{$c}__field {
      background-color: rgba(var(--color-base-grey-light), 0.6);

      #{$c}__icon {
        opacity: 0.6;
      }

      #{$c}__value {
        color: rgb(var(--color-text-secondary));
      }
    }
  }
}
</style>
