/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Ref, ref, onMounted, onBeforeUnmount } from "vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * COMPOSABLE
 * ************************************************************************* */

function useLazyTimerMinutes(): {
  date: Ref<Date>;
} {
  // --> INTERNALS <--

  // Notice: this is an identifier that allows tracing of this timer instance.
  const id = Math.round(Date.now() * Math.random())
    .toString(36)
    .toUpperCase();

  let mounted = false;
  let timer = null as null | ReturnType<typeof setTimeout>;

  // --> DATA <--

  const date = ref(new Date());

  // --> METHODS <--

  const scheduleNextTick = async function () {
    // Important: do not schedule next tick if we are not mounted anymore. \
    //   This protects against late 'whenVisible()' handler firing after we \
    //   got unmounted.
    if (timer === null && mounted === true) {
      // Acquire current timestamp
      const nowTime = Date.now();

      // Acquire date at next minute, at second zero (clone current date)
      const nextMinuteDate = new Date(nowTime);

      nextMinuteDate.setSeconds(0);
      nextMinuteDate.setMinutes(nextMinuteDate.getMinutes() + 1);

      // Calculate time remaining to next minute
      const timeToNextMinute = nextMinuteDate.getTime() - nowTime;

      // Schedule next timer (to fire at next minute, at second zero)
      // Important: do not use a reliable timeout scheduler here, since the \
      //   date output value is solely used by UI and therefore we want to \
      //   avoid triggering UI digests when the application is put in the \
      //   background.
      timer = setTimeout(() => {
        timer = null;

        // Fire only when the app is visible
        // Notice: this helps avoiding DOM mutations and firing timers when \
        //   the app spends its time idling in the background in invisible \
        //   mode, which for most users, should be most of the time.
        Store.$session.whenVisible(() => {
          // Update date
          // Important: do not assign 'nextMinuteDate' here, since the \
          //   JavaScript VM might have throttled this timer and thus the date \
          //   might have became stale relative to now. Always create a new \
          //   date object for this reason.
          date.value = new Date();

          logger.info(
            `Fired minute timer, and updated date value for current minute ` +
              `[#${id}]`
          );

          // Schedule next timer tick
          scheduleNextTick();
        });
      }, timeToNextMinute);

      logger.debug(
        `Scheduled next minute timer tick in ${timeToNextMinute}ms [#${id}]`
      );
    } else {
      logger.warn(
        `Ignored scheduling of minute timer ` +
          `(not mounted anymore, or timer already scheduled) [#${id}]`
      );
    }
  };

  // --> LIFECYCLE <--

  onMounted(() => {
    // Mark as mounted
    mounted = true;

    // Schedule first timer tick
    scheduleNextTick();
  });

  onBeforeUnmount(() => {
    // Mark as unmounted
    mounted = false;

    // Unschedule timer? (if any)
    if (timer !== null) {
      clearTimeout(timer);

      timer = null;
    }
  });

  return { date };
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { useLazyTimerMinutes };
