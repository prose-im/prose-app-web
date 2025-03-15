/*
 * This file is part of prose-app-web
 *
 * Copyright 2025, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: FILTERS
import stringFilters from "@/filters/string";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum DayOfWeek {
  // Monday day-of-week
  Monday = 1,
  // Tuesday day-of-week
  Tuesday = 2,
  // Wednesday day-of-week
  Wednesday = 3,
  // Thursday day-of-week
  Thursday = 4,
  // Friday day-of-week
  Friday = 5,
  // Saturday day-of-week
  Saturday = 6,
  // Sunday day-of-week
  Sunday = 0
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type HoursMinutes = string; // "HH:MM", eg. "23:30"

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const MINUTES_IN_HOUR = 60; // 60 minutes
const HOURS_IN_DAY = 24; // 24 hours

const HOURS_MINUTES_INCREMENTS = 30; // 30 minutes

/**************************************************************************
 * DATE
 * ************************************************************************* */

class UtilitiesDate {
  isWeekend(timestamp: number): boolean {
    const dayIndex = new Date(timestamp).getDay() as DayOfWeek;

    // Is it week-end? (Saturday or Sunday)
    if (dayIndex === DayOfWeek.Saturday || dayIndex === DayOfWeek.Sunday) {
      return true;
    }

    // Not week-end (default, all other days)
    return false;
  }

  isTimeAfterHoursMinutes(
    timestamp: number,
    hoursMinutes: HoursMinutes,
    midnightDayPlusOne = false
  ): boolean {
    const parsedHoursMinutes = this.__parseHoursMinutes(hoursMinutes);

    if (parsedHoursMinutes !== null) {
      const [hours, minutes] = parsedHoursMinutes;

      const referenceDate = new Date(timestamp),
        afterDate = new Date(timestamp);

      // Apply hours and minutes to date
      // Important: reset seconds and milliseconds to zero.
      afterDate.setHours(hours, minutes, 0, 0);

      // Apply day +1? (it is midnight)
      if (midnightDayPlusOne === true && hours === 0 && minutes === 0) {
        afterDate.setDate(afterDate.getDate() + 1);
      }

      // Is the reference date after the after date?
      if (referenceDate >= afterDate) {
        return true;
      }
    }

    // Not after (default)
    return false;
  }

  isTimeBeforeHoursMinutes(
    timestamp: number,
    hoursMinutes: HoursMinutes,
    midnightDayPlusOne = true
  ): boolean {
    // If not after, then we are before
    // Important: consider midnight as day plus one!
    return !this.isTimeAfterHoursMinutes(
      timestamp,
      hoursMinutes,
      midnightDayPlusOne
    );
  }

  *hoursMinutesAfter(
    hoursMinutes: HoursMinutes,
    offsetByOneIncrement = false
  ): Generator<HoursMinutes> {
    const parsedHoursMinutes = this.__parseHoursMinutes(hoursMinutes);

    if (parsedHoursMinutes !== null) {
      let [hours, minutes] = parsedHoursMinutes;

      // Yield starting hours and minutes? (if not offsetting)
      if (offsetByOneIncrement !== true) {
        yield this.__makeHoursMinute(hours, minutes);
      }

      // Yield hours and minutes by increments
      while (true) {
        // Increment minutes
        minutes += HOURS_MINUTES_INCREMENTS;

        // Progress to next hour?
        if (minutes >= MINUTES_IN_HOUR) {
          minutes = 0;
          hours += 1;
        }

        // Progress to next day? (ie. reset counters)
        if (hours >= HOURS_IN_DAY) {
          hours = 0;
          minutes = 0;
        }

        // Stop yielding here
        if (hours === 0 && minutes === 0) {
          // Yield last increment? (if offsetting)
          if (offsetByOneIncrement === true) {
            yield this.__makeHoursMinute(hours, minutes);
          }

          break;
        }

        // Yield incremented hours and minutes
        yield this.__makeHoursMinute(hours, minutes);
      }
    }
  }

  private __makeHoursMinute(hours: number, minutes: number): HoursMinutes {
    return [
      stringFilters.padNumber(hours),
      stringFilters.padNumber(minutes)
    ].join(":");
  }

  private __parseHoursMinutes(
    hoursMinutes: HoursMinutes
  ): [number, number] | null {
    const [hoursText, minutesText] = hoursMinutes.split(":");

    if (hoursText && minutesText) {
      // Parse hours and minutes to numbers
      const hours = parseInt(hoursText),
        minutes = parseInt(minutesText);

      if (isNaN(hours) === false && isNaN(minutes) === false) {
        return [hours, minutes];
      }
    }

    return null;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesDate();
