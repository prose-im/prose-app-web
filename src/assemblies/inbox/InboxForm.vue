<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-toolbar(
  class="a-inbox-form"
)
  template(
    v-slot:left
  )
    layout-actions
      base-action(
        class="a-inbox-form__action"
        icon="textformat.alt"
        size="18px"
      )

  template(
    v-slot:middle
  )
    form.a-inbox-form__compose(
      @submit.prevent="onSubmit"
    )
      form-field(
        v-model="message"
        class="a-inbox-form__compose-field"
        type="textarea"
        name="message"
        placeholder="Message Valerian"
        size="large"
      )

  template(
    v-slot:right
  )
    layout-actions
      base-action(
        class="a-inbox-form__action"
        icon="paperclip"
        size="18px"
      )

      base-action(
        class="a-inbox-form__action"
        icon="face.smiling"
        size="18px"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxForm",

  data() {
    return {
      // --> STATE <--

      message: ""
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onSubmit(): void {
      // TODO
      console.error("send message: " + this.message);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-form";

// VARIABLES
$form-compose-padding-block: 10px;
$form-compose-field-height-minimum: (
  $size-inbox-form-height - (2 * $form-compose-padding-block)
);

.a-inbox-form {
  #{$c}__compose {
    margin-inline: 10px;

    &,
    #{$c}__compose-field {
      width: 100%;
    }

    #{$c}__compose-field {
      /* TODO: remove base height please */
      height: $form-compose-field-height-minimum;
      min-height: $form-compose-field-height-minimum;
      max-height: 220px;
      padding-block: $form-compose-padding-block;
    }
  }
}
</style>
