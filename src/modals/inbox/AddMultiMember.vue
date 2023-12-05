<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-modal(
  @close="$emit('close')"
  @confirm="onConfirm"
  :confirm-loading="loading"
  confirm-label="Add Member"
  class="m-add-multi-member"
  size="large"
)
  p.u-medium
    | Add a new member

  form-field(
    v-model="member.jid"
    @change="onFieldChange"
    @submit="onConfirm"
    :suggestions="suggestions"
    placeholder="Enter member address…"
    name="address"
    type="text"
    size="large"
    align="left"
    class="m-add-multi-member__field"
    submittable
    autofocus
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import { Suggestion as FormFieldSuggestSuggestion } from "@/components/form/FormFieldSuggest.vue";
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: STORES
import Store from "@/store";
import { RosterEntry } from "@/store/tables/roster";

// INTERFACES
interface RosterListPart {
  entry: RosterEntry;

  values: {
    name: {
      full: string;
      first: string;
      last: string;
    };

    jid: {
      full: string;
      node: string;
      domain: string;
    };
  };
}

export default {
  name: "AddMultiMember",

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "add"],

  data() {
    return {
      // --> STATE <--

      member: {
        jid: ""
      },

      suggestions: [] as Array<FormFieldSuggestSuggestion>
    };
  },

  computed: {
    roster(): typeof Store.$roster {
      return Store.$roster;
    },

    rosterListParts(): Array<RosterListPart> {
      return this.roster.getList().map((entry: RosterEntry) => {
        const nameParts = entry.name.toLowerCase().split(" "),
          jidParts = entry.jid.toLowerCase().split("@");

        return {
          entry,

          values: {
            name: {
              full: nameParts.join(" "),

              first:
                (nameParts.length > 2
                  ? nameParts.slice(0, -1).join(" ")
                  : nameParts[0]) || "",

              last:
                (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "") ||
                ""
            },

            jid: {
              full: jidParts.join("@"),
              node: jidParts[0] || "",
              domain: jidParts[1] || ""
            }
          }
        };
      });
    }
  },

  methods: {
    // --> HELPERS <--

    filterSuggestions(value: string): Array<FormFieldSuggestSuggestion> {
      return this.rosterListParts
        .filter((part: RosterListPart) => {
          const values = part.values;

          return (
            values.name.full.startsWith(value) ||
            values.name.first.startsWith(value) ||
            values.name.last.startsWith(value) ||
            values.jid.full.startsWith(value) ||
            values.jid.node.startsWith(value) ||
            values.jid.domain === value ||
            `@${values.jid.domain}` === value
          );
        })
        .map((part: RosterListPart) => {
          return {
            label: part.entry.name,
            value: part.entry.jid
          };
        });
    },

    // --> EVENT LISTENERS <--

    onFieldChange(value: string): void {
      // Normalize value (to lower case)
      value = value.toLowerCase();

      // Attempt to find part that matches JID exactly
      const exactJIDMatchPart = this.rosterListParts.find(
        (part: RosterListPart) => {
          return value === part.values.jid.full;
        }
      );

      // Filter suggestions? (only if exact JID match was not found)
      if (!exactJIDMatchPart) {
        this.suggestions = this.filterSuggestions(value);
      } else {
        this.suggestions = [];
      }
    },

    onConfirm(): void {
      const jidUnsafeString = this.member.jid || null;

      if (jidUnsafeString === null) {
        BaseAlert.warning("Address required", "Please enter an address");
      } else {
        try {
          // Attempt to parse JID (this might fail, in which case the JID \
          //   needs to be considered invalid)
          const jid = new JID(jidUnsafeString);

          // Add member address
          this.$emit("add", jid);
        } catch (_) {
          BaseAlert.warning(
            "Invalid address",
            "Make sure this address is valid"
          );
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-add-multi-member";

.m-add-multi-member {
  #{$c}__field {
    margin-block-start: 20px;
  }
}
</style>
