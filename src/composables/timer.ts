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

/**************************************************************************
 * COMPOSABLE
 * ************************************************************************* */

function useTimerMinutes(): {
  date: Ref<Date>;
} {
  // --> INTERNALS <--

  let timer = null as null | ReturnType<typeof setTimeout>;

  // --> DATA <--

  const date = ref(new Date());

  // --> METHODS <--

  const scheduleNextTick = async function () {
    if (timer === null) {
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

        // Update date
        // Important: do not assign 'nextMinuteDate' here, since the \
        //   JavaScript VM might have throttled this timer and thus the date \
        //   might have became stale relative to now. Always create a new date \
        //   object for this reason.
        date.value = new Date();

        // Schedule next timer tick
        scheduleNextTick();
      }, timeToNextMinute);
    }
  };

  // --> LIFECYCLE <--

  onMounted(() => {
    // Schedule first timer tick
    scheduleNextTick();
  });

  onBeforeUnmount(() => {
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

export { useTimerMinutes };
