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
    {
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
    class="c-form-select__input"
  )

  .c-form-select__field(
    @click="onFieldClick"
  )

  .c-form-select__options(
    v-if="visible"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "FormSelect",

  props: {
    modelValue: {
      type: String,
      default: null
    },

    name: {
      type: String,
      default: null
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
    }
  },

  emits: ["update:modelValue"],

  data() {
    return {
      // --> STATE <--

      value: "",

      visible: false
    };
  },

  watch: {
    modelValue: {
      immediate: true,

      handler(value) {
        this.value = value;
      }
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onFieldClick(): void {
      this.visible = !this.visible;
    },

    onInputChange(event: Event): void {
      // Update model value?
      if (event.target) {
        this.$emit(
          "update:modelValue",
          (event.target as HTMLInputElement).value
        );
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

.c-form-select {
  #{$c}__input {
    display: none;
  }

  #{$c}__field {
    background-color: $color-white;
    border: 1px solid rgba($color-black, 0.1);
    color: $color-text-primary;
    width: 100%;
    padding-block: $size-form-select-padding-block;
    transition-property: border-color;
    border-radius: $size-form-select-border-radius;
    box-shadow: 0 2px 3px 0 rgba($color-black, 0.01);
    cursor: pointer;
  }

  #{$c}__options {
    /* TODO */
  }

  // --> SIZES <--

  &--medium {
    #{$c}__field {
      height: $size-form-select-medium-height;
    }
  }

  &--mid-medium {
    #{$c}__field {
      height: $size-form-select-mid-medium-height;
    }
  }

  &--large {
    #{$c}__field {
      height: $size-form-select-large-height;
    }
  }

  &--mid-large {
    #{$c}__field {
      height: $size-form-select-mid-large-height;
    }
  }

  &--ultra-large {
    #{$c}__field {
      height: $size-form-select-ultra-large-height;
    }
  }

  // --> ALIGNS <--

  &--left {
    /* TODO */
  }

  &--center {
    /* TODO */
  }

  &--right {
    /* TODO */
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }
  }
}
</style>
