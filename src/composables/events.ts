/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { onMounted, onBeforeUnmount } from "vue";
import { default as mitt, Handler as MittHandler } from "mitt";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type Events = {
  [eventName: string]: MittHandler<any>;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface GenericStoreEvents {
  events(): ReturnType<typeof mitt>;
}

/**************************************************************************
 * COMPOSABLE
 * ************************************************************************* */

function useEvents(store: GenericStoreEvents, events: Events): void {
  // --> LIFECYCLE <--

  onMounted(() => {
    // Bind all events
    for (const eventName in events) {
      store.events().on(eventName, events[eventName]);
    }
  });

  onBeforeUnmount(() => {
    // Unbind all events
    for (const eventName in events) {
      store.events().off(eventName, events[eventName]);
    }
  });
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { useEvents };
