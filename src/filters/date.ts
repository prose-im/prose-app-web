/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const SECOND_TO_MILLISECONDS = 1000; // 1 second
const SECOND_TO_MINUTES = 60; // 1 minute
const SECOND_TO_HOURS = 3600; // 1 hour
const SECOND_TO_DAYS = 86400; // 1 day

const MINUTE_TO_MILLISECONDS = 60000; // 1 minute

const HOUR_TO_MINUTES = 60; // 1 hour

/**************************************************************************
 * FILTERS
 ***************************************************************************/

class FilterDate {
  timeAgo(timestamp: number, withAgo = false): string {
    // This converts a timestamp into a 'time ago' string representation. This \
    //   expresses in a short way how much time has passed since timestamp. As \
    //   an example, this method could output eg. '2m ago'.

    // Compute elapsed seconds between now and provided date
    const elapsedSeconds = Math.round(
      (Date.now() - new Date(timestamp).getTime()) / SECOND_TO_MILLISECONDS
    );

    // Acquire 'time ago' string representation
    let timeAgo,
      mayAppendAgo = true;

    if (elapsedSeconds < SECOND_TO_MINUTES) {
      // A few seconds ago
      timeAgo = "now";
      mayAppendAgo = false;
    } else if (elapsedSeconds < SECOND_TO_HOURS) {
      // A few minutes ago
      timeAgo = `${Math.floor(elapsedSeconds / SECOND_TO_MINUTES)}m`;
    } else if (elapsedSeconds < SECOND_TO_DAYS) {
      // A few hours ago
      timeAgo = `${Math.floor(elapsedSeconds / SECOND_TO_HOURS)}h`;
    } else {
      // A few days ago
      timeAgo = `${Math.floor(elapsedSeconds / SECOND_TO_DAYS)}d`;
    }

    // Append 'ago' suffix? (only if 'with ago' is requested)
    if (mayAppendAgo === true && withAgo === true) {
      timeAgo += " ago";
    }

    return timeAgo;
  }

  localTime(date: Date, offset: number): string {
    // Apply offset to date (in minutes)
    // Notice: create new date object, as not to mutate the provided one.
    const localDate = new Date(
      date.getTime() + offset * MINUTE_TO_MILLISECONDS
    );

    // Generate local time from date (from the UTC timezone, as offset has \
    //   already been applied, therefore from a POV of UTC we will read the \
    //   local time)
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    }).format(localDate);
  }
}

/**************************************************************************
 * EXPORTS
 ***************************************************************************/

export default new FilterDate();
