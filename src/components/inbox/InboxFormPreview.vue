<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-form-inbox-preview.u-select(
  v-html="messageHtml"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: BROKER
import Broker from "@/broker";

export default {
  name: "InboxFormPreview",

  props: {
    message: {
      type: String,
      default: ""
    }
  },

  computed: {
    messageHtml(): string {
      return Broker.$message.previewMarkdown(this.message) || "";
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-inbox-preview";

#{$c} {
  border: 1px solid rgba(var(--color-black), 0.04);
  color: rgb(var(--color-text-primary));
  font-size: $font-size-baseline;
  line-height: $size-form-field-large-textarea-line-height;
  letter-spacing: 0.1px;
  padding-block: $size-form-field-large-textarea-padding-block;
  padding-inline: $size-form-field-large-padding-sides;
  overflow-x: hidden;
  overflow-y: auto;
  border-radius: $size-form-field-border-radius;
  box-sizing: border-box;

  /* Notice: what follows is an imitation of '@prose-im/prose-core-views' \
       message styles, since we do not want to mount a frame here again and \
       again. It is not very DRY, but at the same time it is the best we can \
       come up with given all constraints. */

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  strong {
    font-weight: $font-weight-bolder;
  }

  em {
    font-style: italic;
  }

  a {
    color: rgb(var(--color-base-blue-dark));
    text-decoration: underline;
  }

  ul,
  ol {
    padding-left: 1.75em;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  pre,
  blockquote {
    margin-top: 0.35em;
    display: block;

    &,
    &:last-child {
      margin-bottom: 0.35em;
    }
  }

  hr {
    background-color: rgb(var(--color-border-primary));
    border: 0 none;
    height: 1px;
    margin-top: 1em;
  }

  code {
    background-color: rgb(var(--color-base-grey-light));
    border: 1px solid rgb(var(--color-border-primary));
    font-family: $font-family-code;
    font-size: 0.8em;
    padding: 0 3px;
    display: inline-block;
    border-radius: $size-common-inner-border-radius;
  }

  pre {
    width: fit-content;
    min-width: 60%;
    max-width: 100%;
  }

  pre code {
    color: rgb(var(--color-white-fixed));
    background-color: rgba(var(--color-black-fixed), 0.85);
    border: 0 none;
    line-height: 1.6em;
    padding: 8px 14px;
    overflow: auto;
    display: block;
  }

  blockquote {
    border-left: 2.5px solid rgba(var(--color-base-grey-normal), 0.25);
    padding-left: 9px;
    padding-top: 0.05em;
  }

  > * {
    margin-bottom: 1em;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
