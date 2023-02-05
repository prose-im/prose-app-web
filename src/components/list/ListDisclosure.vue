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
    "c-list-disclosure",
    {
      "c-list-disclosure--separated": separated,
      "c-list-disclosure--expanded": isListVisible
    }
  ]`
)
  div(
    @click="onHeaderClick"
    :class=`[
      "c-list-disclosure__header",
      {
        [headerClass]: headerClass
      }
    ]`
  )
    span.c-list-disclosure__header-title.u-medium
      | {{ title }}

    base-icon(
      name="chevron.right"
      size="8px"
      class="c-list-disclosure__header-arrow"
    )

  div(
    v-if="isListRenderable"
    :class=`[
      "c-list-disclosure__list",
      {
        [listClass]: listClass
      }
    ]`
  )
    slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "ListDisclosure",

  props: {
    title: {
      type: String,
      required: true
    },

    separated: {
      type: Boolean,
      default: false
    },

    expanded: {
      type: Boolean,
      default: false
    },

    headerClass: {
      type: String,
      default: null
    },

    listClass: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      // --> STATE <--

      isListVisible: false,
      isListRenderable: false
    };
  },

  created() {
    // Initialize list visible initial value
    this.toggleListVisible(this.expanded);
  },

  methods: {
    // --> HELPERS <--

    toggleListVisible(visible: boolean): void {
      this.isListVisible = visible;

      // Render list in DOM?
      // Notice: list is not rendered by default, so that there is no DOM \
      //   injection overhead when initializing this component in collapsed \
      //   mode with a huge list.
      if (visible === true && this.isListRenderable !== true) {
        this.isListRenderable = true;
      }
    },

    // --> EVENT LISTENERS <--

    onHeaderClick(): void {
      // Toggle list visibility
      this.toggleListVisible(!this.isListVisible);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-list-disclosure";

.c-list-disclosure {
  #{$c}__header {
    color: $color-base-grey-normal;
    font-size: 12.5px;
    line-height: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      color: darken($color-base-grey-normal, 20%);

      #{$c}__header-arrow {
        fill: darken($color-base-grey-normal, 15%);
      }
    }

    &:active {
      color: darken($color-base-grey-normal, 35%);

      #{$c}__header-arrow {
        fill: darken($color-base-grey-normal, 25%);
      }
    }

    #{$c}__header-title {
      flex: 1;
    }

    #{$c}__header-arrow {
      fill: $color-base-grey-normal;
      margin-inline-start: 5px;
      flex: 0 0 auto;
      transition: transform 100ms linear;
    }
  }

  #{$c}__list {
    margin-block-start: 8px;
    display: none;
  }

  // --> BOOLEANS <--

  &--separated {
    #{$c}__header {
      border-bottom: 1px solid rgba($color-base-grey-normal, 0.2);
      padding-bottom: 4px;
    }
  }

  &--expanded {
    #{$c}__header {
      #{$c}__header-arrow {
        transform: rotate(90deg);
      }
    }

    #{$c}__list {
      display: block;
    }
  }
}
</style>
