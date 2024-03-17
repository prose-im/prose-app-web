/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * TITLE
 * ************************************************************************* */

class UtilitiesTitle {
  private __baseTitle: string;
  private __lastTitle: string | void = undefined;
  private __unreadCount = 0;

  constructor() {
    // Initialize titles (from page title)
    this.__baseTitle = document.title;
  }

  update(title: string | void): void {
    // Update with new title
    this.__apply(title, this.__unreadCount);

    // Update last title
    this.__lastTitle = title;
  }

  reset(): void {
    // Reset last title (back to nothing)
    this.__lastTitle = undefined;

    // Re-compute title
    this.update();
  }

  setUnreadCount(count: number): void {
    // Unread count changed?
    if (count !== this.__unreadCount) {
      // Update unread count marker
      this.__unreadCount = count;

      // Re-compute title (using last used title)
      this.update(this.__lastTitle);
    }
  }

  private __apply(title: string | void, unreadCount: number): void {
    // Generate full title
    let fullTitle;

    if (title) {
      fullTitle = `${title} | ${this.__baseTitle}`;
    } else {
      fullTitle = this.__baseTitle;
    }

    // Add unread count prefix? (if any)
    if (unreadCount > 0) {
      fullTitle = `💬(${unreadCount}) ${fullTitle}`;
    }

    // Assign title
    document.title = fullTitle;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesTitle();
