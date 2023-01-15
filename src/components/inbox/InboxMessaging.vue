<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-messaging
  iframe.c-inbox-messaging__frame(
    @load="onFrameLoad"
    src="/includes/views/messaging.html"
    ref="frame"
    sandbox="allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const MESSAGE_FIXTURES = [
  {
    id: "b4d303b1-17c9-4863-81b7-bc5281f3590f",
    type: "text",
    date: "2022-06-22T19:15:03.000Z",
    from: "valerian@prose.org",
    content:
      "Quick message just to confirm that I asked the designers for a new illustration.",

    metas: {
      encrypted: true,
      edited: false
    }
  },

  {
    id: "2abc1d01-da43-45bd-8bdd-a1b37c072ff1",
    type: "text",
    date: "2022-06-22T19:15:04.000Z",
    from: "valerian@prose.org",
    content: "We need one more for the blog.",

    metas: {
      encrypted: true,
      edited: false
    }
  },

  {
    id: "fe685272-2a23-4701-9e4e-a9605697b8c7",
    type: "text",
    date: "2022-06-24T19:15:05.000Z",
    from: "valerian@prose.org",
    content: "Might be done tomorrow 😀",

    metas: {
      encrypted: true,
      edited: false
    },

    reactions: [
      {
        reaction: "🤠",
        authors: ["valerian@prose.org", "baptiste@prose.org"]
      },

      {
        reaction: "🚀",
        authors: ["baptiste@prose.org"]
      }
    ]
  }
];

export default {
  name: "InboxMessaging",

  methods: {
    // --> HELPERS <--

    setupContext(runtime: Window) {
      // TODO: from dynamic context
      runtime.MessagingContext.setLanguage("en");
      runtime.MessagingContext.setStyleTheme("light");
      runtime.MessagingContext.setAccountJID("valerian@prose.org");
    },

    setupEvents(runtime: Window) {
      runtime.MessagingEvent.on(
        "message:actions:view",
        this.onEventMessageActionsView
      );

      runtime.MessagingEvent.on(
        "message:reactions:view",
        this.onEventMessageReactionsView
      );

      runtime.MessagingEvent.on(
        "message:reactions:react",
        this.onEventMessageReactionsReact
      );

      runtime.MessagingEvent.on(
        "message:history:seek",
        this.onEventMessageHistorySeek
      );
    },

    setupStore(runtime: Window) {
      // TODO: those are fixtures
      runtime.MessagingStore.loader("forwards", true);

      setTimeout(() => {
        runtime.MessagingStore.identify("valerian@prose.org", {
          name: "Valerian",
          avatar:
            "https://gravatar.com/avatar/b4cb8302ee37f985cc76190aaae1b40b?size=80"
        });

        runtime.MessagingStore.insert(...MESSAGE_FIXTURES);

        runtime.MessagingStore.loader("forwards", false);
      }, 500);
    },

    // --> EVENT LISTENERS <--

    onFrameLoad(): void {
      const frameRuntime = this.$refs.frame.contentWindow;

      // Setup frame
      this.setupContext(frameRuntime);
      this.setupEvents(frameRuntime);
      this.setupStore(frameRuntime);
    },

    onEventMessageActionsView(event: object): void {
      this.$log.debug("Got message actions view", event);
    },

    onEventMessageReactionsView(event: object): void {
      this.$log.debug("Got message reactions view", event);
    },

    onEventMessageReactionsReact(event: object): void {
      this.$log.debug("Got message reactions react", event);
    },

    onEventMessageHistorySeek(event: object): void {
      this.$log.debug("Got message history seek", event);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-messaging";

.c-inbox-messaging {
  #{$c}__frame {
    height: 100%;
    width: 100%;
  }
}
</style>
