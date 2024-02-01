/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Ref, ComputedRef, ref, computed } from "vue";

// PROJECT: COMPONENTS
import { Suggestion as FormFieldSuggestSuggestion } from "@/components/form/FormFieldSuggest.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

// PROJECT: STORES
import Store from "@/store";
import { ChannelEntry } from "@/store/tables/channel";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface ChannelSuggestorPart {
  entry: ChannelEntry;

  values: {
    name: string;
    jid: string;
  };
}

/**************************************************************************
 * COMPOSABLE
 * ************************************************************************* */

function useChannelSuggestor(): {
  query: Ref<string>;
  suggestions: ComputedRef<Array<FormFieldSuggestSuggestion>>;
} {
  // --> DATA <--

  const query = ref("");

  // --> METHODS <--

  const filterSuggestions = function (
    parts: Array<ChannelSuggestorPart>,
    value: string
  ): Array<FormFieldSuggestSuggestion> {
    return parts
      .filter((part: ChannelSuggestorPart) => {
        return (
          part.values.name.startsWith(value) ||
          part.values.jid.startsWith(value)
        );
      })
      .map((part: ChannelSuggestorPart) => {
        return {
          label: part.entry.name,
          value: part.entry.name,
          match: value,
          replacement: part.entry.name,

          icon: {
            component: BaseIcon,

            properties: {
              name: "circle.grid.2x2",
              size: "11px"
            }
          }
        };
      });
  };

  // --> COMPUTED <--

  const parts = computed(() => {
    return Store.$channel.getList().map((entry: ChannelEntry) => {
      return {
        entry,

        values: {
          name: entry.name.toLowerCase(),
          jid: entry.jid.toLowerCase()
        }
      };
    });
  });

  const suggestions = computed(() => {
    // Acquire normalized query (to lower case)
    const value = query.value.toLowerCase();

    // Attempt to find part that matches name or JID exactly
    const exactMatchPart = parts.value.find((part: ChannelSuggestorPart) => {
      return value === part.values.name || value === part.values.jid;
    });

    // Filter suggestions? (only if exact name or JID match was not found)
    if (!exactMatchPart) {
      return filterSuggestions(parts.value, value);
    }

    return [];
  });

  return { query, suggestions };
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { useChannelSuggestor };
