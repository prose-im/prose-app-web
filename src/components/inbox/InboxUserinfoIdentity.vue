<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-userinfo-identity
  base-avatar(
    class="c-inbox-userinfo-identity__avatar"
    jid="valerian@prose.org"
    size="100px"
  )

  .c-inbox-userinfo-identity__details
    p.c-inbox-userinfo-identity__name.u-bold
      | Valerian Saliou

    p.c-inbox-userinfo-identity__role
      | CTO at Crisp

  ul.c-inbox-userinfo-identity__actions
    li.c-inbox-userinfo-identity__action
      a.c-inbox-userinfo-identity__action-button
        | Phone

    li.c-inbox-userinfo-identity__action
      a.c-inbox-userinfo-identity__action-button
        | Email
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxUserinfoIdentity"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-userinfo-identity";

.c-inbox-userinfo-identity {
  text-align: center;

  #{$c}__avatar {
    margin-block-end: 16px;
  }

  #{$c}__details {
    margin-block-end: 16px;

    #{$c}__name {
      color: $color-text-primary;
      font-size: 15px;
    }

    #{$c}__role {
      color: $color-text-secondary;
      font-size: 13px;
      margin-block-start: 6px;
    }
  }

  #{$c}__actions {
    #{$c}__action {
      margin-inline: 14px;
      display: inline-block;

      #{$c}__action-button {
        color: $color-base-blue-normal;
      }
    }
  }
}
</style>
