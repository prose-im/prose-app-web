/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { onMounted, onUnmounted } from "vue";

// PROJECT: UTILITIES
import UtilitiesTitle from "@/utilities/title";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type Setter = (mounted: boolean) => void;

/**************************************************************************
 * COMPOSABLE
 * ************************************************************************* */

function useInterfaceMounted(setter: Setter): void {
  // --> LIFECYCLE <--

  onMounted(() => {
    setter(true);
  });

  onUnmounted(() => {
    setter(false);
  });
}

function useInterfaceTitle(title: string): void {
  // --> LIFECYCLE <--

  onMounted(() => {
    // Update current title
    UtilitiesTitle.update(title);
  });
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { useInterfaceMounted, useInterfaceTitle };
