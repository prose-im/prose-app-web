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
const SECOND_TO_WEEKS = 604800; // 1 week

const HOUR_TO_MINUTES = 60; // 1 hour
const DAY_TO_HOURS = 24; // 1 day
const WEEK_TO_DAYS = 7; // 1 week

const MINUTE_TO_MILLISECONDS = 60000; // 1 minute

const DATE_TIME_FORMAT_REGION = "en-US";
const DATE_TIME_FORMAT_TIMEZONE = "UTC";

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
    } else if (elapsedSeconds < SECOND_TO_WEEKS) {
      // A few days ago
      timeAgo = `${Math.floor(elapsedSeconds / SECOND_TO_DAYS)}d`;
    } else {
      // A few weeks ago
      timeAgo = `${Math.floor(elapsedSeconds / SECOND_TO_WEEKS)}w`;
    }

    // Append 'ago' suffix? (only if 'with ago' is requested)
    if (mayAppendAgo === true && withAgo === true) {
      timeAgo += " ago";
    }

    return timeAgo;
  }

  timeLeft(timestamp: number, withLeft = false): string {
    // This converts a timestamp into a 'time left' string representation. \
    //   This expresses in a short way how much time there is left to the \
    //   provided timestamp. As an example, this method could output eg. \
    //   '1h left'.

    // Compute left seconds between future date and now
    const leftSeconds = Math.round(
      (new Date(timestamp).getTime() - Date.now()) / SECOND_TO_MILLISECONDS
    );

    // Acquire 'time left' string representation
    let timeLeft;

    if (leftSeconds < SECOND_TO_MINUTES) {
      // A few seconds left
      timeLeft = `${leftSeconds}s`;
    } else if (leftSeconds < SECOND_TO_HOURS) {
      // A few minutes left
      const leftMinutes = Math.ceil(leftSeconds / SECOND_TO_MINUTES);

      timeLeft = leftMinutes === HOUR_TO_MINUTES ? "1h" : `${leftMinutes}m`;
    } else if (leftSeconds < SECOND_TO_DAYS) {
      // A few hours left
      const leftHours = Math.ceil(leftSeconds / SECOND_TO_HOURS);

      timeLeft = leftHours === DAY_TO_HOURS ? "1d" : `${leftHours}h`;
    } else if (leftSeconds < SECOND_TO_WEEKS) {
      // A few days left
      const leftDays = Math.ceil(leftSeconds / SECOND_TO_DAYS);

      timeLeft = leftDays === WEEK_TO_DAYS ? "1w" : `${leftDays}d`;
    } else {
      // A few weeks left
      timeLeft = `${Math.ceil(leftSeconds / SECOND_TO_WEEKS)}w`;
    }

    // Append 'left' suffix? (only if 'with left' is requested)
    if (withLeft === true) {
      timeLeft += " left";
    }

    return timeLeft;
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
    return new Intl.DateTimeFormat(DATE_TIME_FORMAT_REGION, {
      timeZone: DATE_TIME_FORMAT_TIMEZONE,
      hour: "numeric",
      minute: "numeric",
      hour12: true
    }).format(localDate);
  }

  prettyDateTime(date: Date): string {
    const dateString = date.toLocaleString(DATE_TIME_FORMAT_REGION, {
      timeZone: DATE_TIME_FORMAT_TIMEZONE
    });

    return `${dateString} (${DATE_TIME_FORMAT_TIMEZONE})`;
  }
}

/**************************************************************************
 * EXPORTS
 ***************************************************************************/

export default new FilterDate();
