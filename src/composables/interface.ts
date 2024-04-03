/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { onBeforeMount, onMounted, onUnmounted } from "vue";

// PROJECT: UTILITIES
import UtilitiesTitle from "@/utilities/title";
import UtilitiesRuntime from "@/utilities/runtime";

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

function useInterfaceDownsize(width: number, height: number): void {
  // --> INTERNALS <--

  let previousResizable: boolean | void;
  let previousSize: { width: number; height: number } | void;

  // --> METHODS <--

  const adjustWindow = async function (
    resizable: boolean,
    width: number,
    height: number
  ) {
    [previousResizable, previousSize] = await Promise.all([
      UtilitiesRuntime.requestWindowResizableChange(resizable),
      UtilitiesRuntime.requestWindowSizeUpdate(width, height)
    ]);

    // Re-center window once its size has been changed? (if actually changed)
    if (previousSize !== undefined) {
      await UtilitiesRuntime.requestWindowCenter();
    }
  };

  // --> LIFECYCLE <--

  onBeforeMount(async () => {
    // Downsize window
    await adjustWindow(false, width, height);
  });

  onUnmounted(async () => {
    // Restore pre-downsize window?
    if (previousResizable !== undefined && previousSize !== undefined) {
      await adjustWindow(
        previousResizable,
        previousSize.width,
        previousSize.height
      );
    }
  });
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { useInterfaceMounted, useInterfaceTitle, useInterfaceDownsize };
