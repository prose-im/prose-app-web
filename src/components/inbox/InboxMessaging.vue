<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-messaging(
  ref="container"
)
  iframe.c-inbox-messaging__frame(
    @load="onFrameLoad"
    @click="onFrameClick"
    src="/includes/views/messaging.html"
    ref="frame"
    sandbox="allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
  )

  base-popover-list(
    v-if="popover.items.length > 0"
    :items="popover.items"
    :style=`{
      insetBlockStart: popover.position.blockStart,
      insetInlineStart: popover.position.inlineStart
    }`
    class="c-inbox-messaging__popover"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const POPOVER_ANCHOR_HEIGHT_Y_OFFSET = 7;

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

  data() {
    return {
      // --> STATE <--

      popover: {
        position: {
          blockStart: "0px",
          inlineStart: "0px"
        },

        items: [],
        interaction: null
      }
    };
  },

  methods: {
    // --> HELPERS <--

    setupContext(runtime: Window): void {
      // TODO: from dynamic context
      runtime.MessagingContext.setLanguage("en");
      runtime.MessagingContext.setStylePlatform("web");
      runtime.MessagingContext.setStyleTheme("light");
      runtime.MessagingContext.setAccountJID("valerian@prose.org");
    },

    setupEvents(runtime: Window): void {
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

    setupStore(runtime: Window): void {
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

    setupListeners(runtime: Window): void {
      runtime.addEventListener("click", this.onFrameInnerClick);
    },

    showPopover(anchor: object, items: Array, interaction?: object): void {
      // Clear any previously-shown popover
      this.hidePopover();

      // Compute popover position relative to anchor
      const positionX = anchor.x || 0;

      const positionY =
        (anchor.y || 0) +
        (anchor.height ? anchor.height + POPOVER_ANCHOR_HEIGHT_Y_OFFSET : 0);

      this.popover.position.blockStart = `${positionY}px`;
      this.popover.position.inlineStart = `${positionX}px`;

      // Assign items (will show popover)
      this.popover.items = items;

      // Propagate interaction?
      if (interaction) {
        this.popover.interaction = interaction;

        this.$refs.frame.contentWindow.MessagingStore.interact(
          interaction.id,
          interaction.action,
          true
        );
      }
    },

    hidePopover(): void {
      // Empty items (will hide popover)
      this.popover.items = [];

      // Any interaction to hide?
      if (this.popover.interaction) {
        this.$refs.frame.contentWindow.MessagingStore.interact(
          this.popover.interaction.id,
          this.popover.interaction.action,
          false
        );

        this.popover.interaction = null;
      }
    },

    triggerContainerClick(): void {
      // Trigger ghost click event on container (so that eg. the click away \
      //   directive handles the click event accordingly)
      this.$refs.container.click();
    },

    // --> EVENT LISTENERS <--

    onFrameLoad(): void {
      const frameRuntime = this.$refs.frame.contentWindow;

      // Setup frame
      this.setupContext(frameRuntime);
      this.setupEvents(frameRuntime);
      this.setupStore(frameRuntime);
      this.setupListeners(frameRuntime);
    },

    onFrameInnerClick(): void {
      // Hide popover (if any opened)
      this.hidePopover();

      // Trigger container click
      this.triggerContainerClick();
    },

    onEventMessageActionsView(event: object): void {
      this.$log.debug("Got message actions view", event);

      // Show popover with actions? (if any origin set)
      if (event.origin) {
        // Build popover interaction (if button origin)
        const interaction =
          event.origin.type === "button"
            ? {
                id: event.id,
                action: "actions"
              }
            : null;

        // Show popover
        this.showPopover(
          event.origin.parent || event.origin.anchor,

          [
            // TODO: dynamically insert second part if message is from self

            {
              type: "button",
              icon: "doc.on.clipboard",
              label: "Copy text"
            },

            {
              type: "button",
              icon: "face.smiling",
              label: "Add reaction…"
            },

            {
              type: "divider"
            },

            {
              type: "button",
              icon: "pencil",
              label: "Edit message…",
              emphasis: true
            },

            {
              type: "button",
              icon: "trash",
              label: "Remove message",
              color: "red",
              emphasis: true
            }
          ],

          interaction
        );

        // Trigger container click
        this.triggerContainerClick();
      }
    },

    onEventMessageReactionsView(event: object): void {
      this.$log.debug("Got message reactions view", event);

      // Show popover with actions? (if any origin set)
      if (event.origin) {
        // Build popover interaction (if button origin)
        const interaction =
          event.origin.type === "button"
            ? {
                id: event.id,
                action: "reactions"
              }
            : null;

        // Show popover
        this.showPopover(
          event.origin.parent || event.origin.anchor,

          [
            // TODO: populate those

            {
              type: "button",
              label: "Pick a reaction...",
              color: "blue"
            }
          ],

          interaction
        );

        // Trigger container click
        this.triggerContainerClick();
      }
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
  position: relative;

  #{$c}__frame {
    height: 100%;
    width: 100%;
  }

  #{$c}__popover {
    position: absolute;
    z-index: 1;
  }
}
</style>
