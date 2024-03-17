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
  private __lastTitle: string;
  private __unreadCount = 0;

  constructor() {
    // Initialize titles (from page title)
    this.__baseTitle = document.title;
    this.__lastTitle = this.__baseTitle;
  }

  update(title?: string): void {
    // Acquire base title
    title = title === undefined ? this.__lastTitle : title;

    // Update with new title
    if (this.__unreadCount > 0) {
      document.title = `💬(${this.__unreadCount}) ${title}`;
    } else {
      document.title = title;
    }

    // Update last title
    this.__lastTitle = title;
  }

  reset(): void {
    // Reset last title back to base title
    this.__lastTitle = this.__baseTitle;

    // Re-compute title
    this.update();
  }

  setUnreadCount(count: number): void {
    // Unread count changed?
    if (count !== this.__unreadCount) {
      // Update unread count marker
      this.__unreadCount = count;

      // Re-compute title
      this.update();
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesTitle();
