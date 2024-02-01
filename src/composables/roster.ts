/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Ref, ComputedRef, ref, computed } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import { Suggestion as FormFieldSuggestSuggestion } from "@/components/form/FormFieldSuggest.vue";
import BaseAvatar from "@/components/base/BaseAvatar.vue";

// PROJECT: STORES
import Store from "@/store";
import { RosterEntry } from "@/store/tables/roster";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface RosterSuggestorPart {
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

/**************************************************************************
 * COMPOSABLE
 * ************************************************************************* */

function useRosterSuggestor(): {
  query: Ref<string>;
  suggestions: ComputedRef<Array<FormFieldSuggestSuggestion>>;
} {
  // --> DATA <--

  const query = ref("");

  // --> METHODS <--

  const filterSuggestions = function (
    parts: Array<RosterSuggestorPart>,
    value: string
  ): Array<FormFieldSuggestSuggestion> {
    return parts
      .filter((part: RosterSuggestorPart) => {
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
      .map((part: RosterSuggestorPart) => {
        return {
          label: part.entry.name,
          value: part.entry.jid,

          action: {
            match: value,
            replacement: part.entry.jid
          },

          icon: {
            component: BaseAvatar,

            properties: {
              jid: new JID(part.entry.jid),
              size: "18px",
              shadow: "none"
            }
          }
        };
      });
  };

  // --> COMPUTED <--

  const parts = computed(() => {
    return Store.$roster.getList().map((entry: RosterEntry) => {
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
  });

  const suggestions = computed(() => {
    // Acquire normalized query (to lower case)
    const value = query.value.toLowerCase();

    // Attempt to find part that matches JID exactly
    const exactJIDMatchPart = parts.value.find((part: RosterSuggestorPart) => {
      return value === part.values.jid.full;
    });

    // Filter suggestions? (only if exact JID match was not found)
    if (!exactJIDMatchPart) {
      return filterSuggestions(parts.value, value);
    }

    return [];
  });

  return { query, suggestions };
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { useRosterSuggestor };
