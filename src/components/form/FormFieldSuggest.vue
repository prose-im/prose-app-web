<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
ul(
  v-hotkey="hotkeys"
  :class=`[
    "c-form-field-suggest",
    "c-form-field-suggest--" + size
  ]`
  ref="suggest"
)
  li(
    v-for="(suggestion, index) in suggestions"
    :class=`[
      "c-form-field-suggest__item",
      {
        "c-form-field-suggest__item--active": (index === activeIndex)
      }
    ]`
  )
    a.c-form-field-suggest__link(
      @click="onLinkClick(suggestion)"
      @mouseover="onLinkMouseOver(index)"
    )
      component(
        v-if="suggestion.icon"
        v-bind="suggestion.icon.properties"
        :is="suggestion.icon.component"
        class="c-form-field-suggest__link-icon"
      )

      span.c-form-field-suggest__link-label.u-ellipsis.u-medium
        | {{ suggestion.label }}

      span.c-form-field-suggest__link-value.u-ellipsis(
        v-if="suggestion.value !== suggestion.label"
      )
        | {{ suggestion.value }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// INTERFACES
export interface Suggestion {
  label: string;
  value: string;

  action: {
    match: string;
    replacement: string;
  };

  icon?: {
    component: object;
    properties?: object;
  };
}

export default {
  name: "FormFieldSuggest",

  props: {
    suggestions: {
      type: Array<Suggestion>,
      required: true,

      validator(x: Array<Suggestion>): boolean {
        return x.length > 0;
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
    }
  },

  emits: ["select"],

  data() {
    return {
      // --> STATE <--

      activeIndex: 0
    };
  },

  computed: {
    hasSuggestions(): boolean {
      return this.suggestions.length > 0;
    },

    hotkeys(): { [name: string]: (event: Event) => void } {
      return {
        down: this.onHotkeyDown,
        up: this.onHotkeyUp
      };
    }
  },

  watch: {
    suggestions() {
      // Reset active suggestion index to first one
      this.activeIndex = 0;
    }
  },

  methods: {
    // --> EXTERNALS <--

    selectFromParent(): void {
      // Alias for local select method
      this.select();
    },

    navigateFromParent(increment: number): void {
      // Alias for local navigate method
      this.navigate(increment);
    },

    // --> HELPERS <--

    select(): void {
      if (this.hasSuggestions === true) {
        const activeSuggestion = this.suggestions[this.activeIndex] || null;

        if (activeSuggestion !== null) {
          this.$emit("select", activeSuggestion);
        }
      }
    },

    navigate(increment = 1): void {
      if (this.hasSuggestions === true) {
        const futureActiveIndex = this.activeIndex + increment;

        if (increment < 0) {
          this.activeIndex =
            futureActiveIndex >= 0
              ? futureActiveIndex
              : this.suggestions.length - 1;
        } else {
          this.activeIndex =
            futureActiveIndex < this.suggestions.length ? futureActiveIndex : 0;
        }

        this.scrollToItemIndex(this.activeIndex);
      }
    },

    scrollToItemIndex(index: number): void {
      const suggestElement = (this.$refs.suggest as HTMLElement) || null;

      if (suggestElement !== null) {
        const suggestItemElement = suggestElement.children[index] || null;

        if (suggestItemElement !== null) {
          suggestItemElement.scrollIntoView({
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

    onHotkeyDown(event: Event): void {
      this.eventOverrides(event);

      // Navigate by +1 increment
      this.navigate(1);
    },

    onHotkeyUp(event: Event): void {
      this.eventOverrides(event);

      // Navigate by -1 increment
      this.navigate(-1);
    },

    onLinkClick(suggestion: Suggestion) {
      // Select clicked suggestion
      this.$emit("select", suggestion);
    },

    onLinkMouseOver(index: number) {
      this.activeIndex = index;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-field-suggest";

// VARIABLES
$suggest-padding: 4px;
$suggest-border-radius: $size-form-field-border-radius;

$suggest-sizes: (
  "medium": (
    "link": (
      "line-height": 22px,
      "padding-inline": $size-form-field-medium-padding-sides
    )
  ),

  "mid-medium": (
    "link": (
      "line-height": 24px,
      "padding-inline": $size-form-field-mid-medium-padding-sides
    )
  ),

  "large": (
    "link": (
      "line-height": 28px,
      "padding-inline": $size-form-field-large-padding-sides
    )
  ),

  "mid-large": (
    "link": (
      "line-height": 30px,
      "padding-inline": $size-form-field-mid-large-padding-sides
    )
  ),

  "ultra-large": (
    "link": (
      "line-height": 32px,
      "padding-inline": $size-form-field-ultra-large-padding-sides
    )
  )
);

#{$c} {
  background-color: rgb(var(--color-background-secondary));
  border: 1px solid rgb(var(--color-border-primary));
  padding: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  border-radius: $suggest-border-radius;
  box-shadow: 0 3px 6px 0 rgba(var(--color-shadow-primary), 0.05);

  #{$c}__item {
    &,
    #{$c}__link {
      display: block;
    }

    #{$c}__link {
      font-size: ($font-size-baseline - 1.5px);
      display: flex;
      align-items: center;
      transition: none;
      border-radius: ($suggest-border-radius - 2px);

      #{$c}__link-icon,
      #{$c}__link-label {
        flex: 0 1 auto;
      }

      #{$c}__link-icon {
        margin-inline-end: 8px;

        &:is(svg) {
          fill: rgb(var(--color-base-blue-dark));
        }
      }

      #{$c}__link-label {
        color: rgb(var(--color-text-primary));
      }

      #{$c}__link-value {
        color: rgb(var(--color-text-secondary));
        margin-inline-start: 10px;
        flex: 1;
      }
    }

    &--active {
      #{$c}__link {
        background-color: rgb(var(--color-base-blue-normal));

        &:active {
          background-color: darken-var(var(--color-base-blue-normal), 4%);
        }

        #{$c}__link-label,
        #{$c}__link-value {
          color: rgb(var(--color-text-reverse));
        }

        #{$c}__link-icon {
          &:is(svg) {
            fill: rgb(var(--color-white));
          }
        }
      }
    }
  }

  // --> SIZES <--

  @each $name, $size in $suggest-sizes {
    &--#{$name} {
      #{$c}__item {
        #{$c}__link {
          line-height: map-get(map-get($size, "link"), "line-height");
          padding-inline: (
            map-get(map-get($size, "link"), "padding-inline") - $suggest-padding
          );
        }
      }
    }
  }
}
</style>
