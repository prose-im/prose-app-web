/*
 * This file is part of prose-app-web
 *
 * Copyright 2025, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import UtilitiesDate from "@/utilities/date";

/**************************************************************************
 * CONTEXT
 * ************************************************************************* */

class UtilitiesContext {
  areNotificationsPermitted(): boolean {
    const nowTime = Date.now(),
      preferences = Store.$settings.notifications;

    // Notifications are currently paused?
    if ((preferences.pause.until || 0) > nowTime) {
      return false;
    }

    // Notifications are set to be delivered on week days, but it's currently \
    //   week-end?
    if (
      preferences.configuration.when.days === "weekdays" &&
      UtilitiesDate.isWeekend(nowTime) === true
    ) {
      return false;
    }

    // Notifications are set not to be delivered before this hour?
    if (
      preferences.configuration.when.time.from &&
      UtilitiesDate.isTimeAfterHoursMinutes(
        nowTime,
        preferences.configuration.when.time.from
      ) === false
    ) {
      return false;
    }

    // Notifications are set not to be delivered after this hour?
    if (
      preferences.configuration.when.time.from &&
      preferences.configuration.when.time.to &&
      UtilitiesDate.isTimeBeforeHoursMinutes(
        nowTime,
        preferences.configuration.when.time.to
      ) === false
    ) {
      return false;
    }

    // Notifications are permitted for context (default)
    return true;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesContext();
