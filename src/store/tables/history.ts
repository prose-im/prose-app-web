/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { defineStore } from "pinia";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum HistoryDirection {
  // Forwards direction.
  Forwards = "forwards",
  // Backwards direction.
  Backwards = "backwards"
}

enum HistoryAdjacency {
  // Previous adjacency.
  Previous = "previous",
  // Next adjacency.
  Next = "next"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type HistoryRouteParams = { [key: string]: string | string[] };

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface History {
  current: HistoryRoute;

  adjacent: {
    previous: Array<HistoryRoute>;
    next: Array<HistoryRoute>;
  };
}

interface HistoryRoute {
  name: string;
  params: HistoryRouteParams;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const ADJACENT_ITEMS_THRESHOLD = 20;

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $history = defineStore("history", {
  // Important: DO NOT persist this store, as it contains history-related data.
  persist: false,

  state: (): History => {
    return {
      current: {
        name: "",
        params: {}
      },

      adjacent: {
        previous: [],
        next: []
      }
    };
  },

  actions: {
    setCurrent(name: string, params: HistoryRouteParams): HistoryRoute | null {
      // Void next adjacent routes (as current page was updated, there cannot \
      //   be any next page in the history)
      this.$patch(() => {
        this.adjacent.next = [];
      });

      return this.moveDirection(
        HistoryDirection.Forwards,
        HistoryAdjacency.Previous,
        { name, params }
      );
    },

    movePrevious(): HistoryRoute | null {
      if (this.adjacent.previous.length > 0) {
        return this.moveDirection(
          HistoryDirection.Backwards,
          HistoryAdjacency.Next,
          this.adjacent.previous.shift()
        );
      }

      return null;
    },

    moveNext(): HistoryRoute | null {
      if (this.adjacent.next.length > 0) {
        return this.moveDirection(
          HistoryDirection.Forwards,
          HistoryAdjacency.Previous,
          this.adjacent.next.shift()
        );
      }

      return null;
    },

    moveDirection(
      direction: HistoryDirection,
      adjacency: HistoryAdjacency,
      targetRoute: HistoryRoute | undefined
    ): HistoryRoute | null {
      if (targetRoute !== undefined) {
        // Stack previous current route to adjacent routes? (if any)
        if (this.current.name) {
          // Acquire adjacent routes
          const adjacentRoute = {
            name: this.current.name,
            params: this.current.params
          };
          const adjacentRoutes =
            adjacency === HistoryAdjacency.Next
              ? this.adjacent.next
              : this.adjacent.previous;

          this.$patch(() => {
            // Insert adjacent route
            switch (direction) {
              case HistoryDirection.Forwards: {
                adjacentRoutes.push(adjacentRoute);

                break;
              }

              case HistoryDirection.Backwards: {
                adjacentRoutes.unshift(adjacentRoute);

                break;
              }
            }

            // Limit size of adjacent routes? (as needed)
            if (adjacentRoutes.length > ADJACENT_ITEMS_THRESHOLD) {
              switch (adjacency) {
                case HistoryAdjacency.Previous: {
                  adjacentRoutes.shift();

                  break;
                }

                case HistoryAdjacency.Next: {
                  adjacentRoutes.pop();

                  break;
                }
              }
            }
          });
        }

        // Update current page
        this.$patch(() => {
          this.current.name = targetRoute.name;
          this.current.params = targetRoute.params;
        });
      }

      return null;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $history;
