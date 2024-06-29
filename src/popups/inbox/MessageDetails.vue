<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-popup-navigate(
  @close="onClose"
  size="tiny"
  class="p-message-details"
)
  template(
    v-slot:content
  )
    p.p-message-details__title.u-medium
      | Message details

    template(
      v-for="entry in entries"
    )
      form-fieldset-field(
        v-if="entry.type === entryType.Value"
        :label="entry.data.label"
        class="p-message-details__field"
        input-class="p-message-details__field-input u-ellipsis"
      )
        span(
          :class=`[
            "p-message-details__value",
            {
              ["p-message-details__value--" + entry.data.color]: entry.data.color,
              "p-message-details__value--lighter": entry.data.lighter,
              "u-select": entry.data.selectable,
              "u-bold": entry.data.bolder
            }
          ]`
          :title="entry.data.selectable ? entry.data.value : null"
        )
          | {{ entry.data.value || "?" }}

      base-divider(
        v-else-if="entry.type === entryType.Divider"
        class="p-message-details__spacer"
      )

  template(
    v-slot:actions
  )
    base-popup-actions(
      @cancel="onClose"
      :confirm="false"
      cancel-label="Close"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { Room } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: STORES
import Store from "@/store";
import { InboxEntryMessage } from "@/store/tables/inbox";

// ENUMERATIONS
enum EntryType {
  // Value type.
  Value = "value",
  // Divider type.
  Divider = "divider"
}

// INTERFACE
interface Entry {
  type: EntryType;

  data?: {
    label: string;
    value: string | void;
    color?: string;
    lighter?: boolean;
    selectable?: boolean;
    bolder?: boolean;
  };
}

export default {
  name: "MessageDetails",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    messageId: {
      type: String,
      required: true
    }
  },

  emits: ["close"],

  data() {
    return {
      // --> DATA <--

      entryType: EntryType,

      // --> STATE <--

      message: null as InboxEntryMessage | null
    };
  },

  computed: {
    entries(): Array<Entry> {
      if (this.message !== null) {
        return [
          {
            type: EntryType.Value,

            data: {
              label: "Identifier:",
              value: this.message.id,
              lighter: true,
              selectable: true
            }
          },

          {
            type: EntryType.Divider
          },

          {
            type: EntryType.Value,

            data: {
              label: "Sent on date:",
              value: this.messageDateLocal,
              selectable: true
            }
          },

          {
            type: EntryType.Value,

            data: {
              label: "Sent by user:",
              value: this.message.from,
              selectable: true
            }
          },

          {
            type: EntryType.Value,

            data: {
              label: "Sent to room:",
              value: this.room.id as string,
              selectable: true
            }
          },

          {
            type: EntryType.Divider
          },

          {
            type: EntryType.Value,

            data: {
              label: "Encrypted?",
              value: this.getMetaValue("encrypted"),
              color: this.getMetaState("encrypted") ? "green" : "red",
              bolder: true
            }
          },

          {
            type: EntryType.Value,

            data: {
              label: "Edited?",
              value: this.getMetaValue("edited")
            }
          }
        ];
      }

      return [];
    },

    messageDateLocal(): string | void {
      if (this.message?.date) {
        return this.$filters.date.prettyDateTime(new Date(this.message.date));
      }

      return undefined;
    }
  },

  async mounted() {
    await this.loadMessage();
  },

  methods: {
    // --> HELPERS <--

    async loadMessage(): Promise<void> {
      const message = Store.$inbox.getMessage(this.room.id, this.messageId);

      if (message !== undefined) {
        this.message = message;
      } else {
        // No message found, error out and close
        BaseAlert.warning("Message not loaded", "Cannot show details");

        this.onClose();
      }
    },

    getMetaState(metaKey: string): boolean {
      return (
        (this.message?.metas as { [key: string]: boolean })?.[metaKey] || false
      );
    },

    getMetaValue(metaKey: string): string {
      return this.getMetaState(metaKey) === true ? "Yes" : "No";
    },

    // --> EVENT LISTENERS <--

    onClose(): void {
      this.$emit("close");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-message-details";

#{$c} {
  #{$c}__title {
    margin-block-end: 24px;
  }

  #{$c}__field {
    #{$c}__field-input {
      line-height: 18px;
    }
  }

  #{$c}__value {
    color: rgb(var(--color-text-primary));
    font-size: $font-size-baseline;

    &--lighter {
      color: rgb(var(--color-text-secondary));
    }

    &--green {
      color: rgb(var(--color-base-green-normal));
    }

    &--red {
      color: rgb(var(--color-base-red-normal));
    }
  }

  #{$c}__spacer {
    margin-block: 15px;
  }
}
</style>
