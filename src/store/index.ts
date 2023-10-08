/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { App } from "vue";
import { Pinia, createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

// PROJECT: STORE
import $session from "@/store/tables/session";
import $history from "@/store/tables/history";
import $layout from "@/store/tables/layout";
import $account from "@/store/tables/account";
import $avatar from "@/store/tables/avatar";
import $profile from "@/store/tables/profile";
import $inbox from "@/store/tables/inbox";
import $roster from "@/store/tables/roster";
import $activity from "@/store/tables/activity";
import $presence from "@/store/tables/presence";
import $settings from "@/store/tables/settings";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const STORE_PERSIST_PREFIX = "prose";
const STORE_PERSIST_REVISION = "v1";
const STORE_PERSIST_BOOT = "boot";

const STORE_KEY_PREFIX = "$";
const STORE_RESET_IGNORES = ["account", "layout"];

/**************************************************************************
 * STORE
 * ************************************************************************* */

class Store {
  private readonly __store: Pinia;

  // Transient stores
  $session!: ReturnType<typeof $session>;
  $history!: ReturnType<typeof $history>;

  // Permanent stores
  $layout!: ReturnType<typeof $layout>;
  $account!: ReturnType<typeof $account>;
  $avatar!: ReturnType<typeof $avatar>;
  $profile!: ReturnType<typeof $profile>;
  $inbox!: ReturnType<typeof $inbox>;
  $roster!: ReturnType<typeof $roster>;
  $activity!: ReturnType<typeof $activity>;
  $presence!: ReturnType<typeof $presence>;
  $settings!: ReturnType<typeof $settings>;

  constructor() {
    this.__store = createPinia();
  }

  bind(app: App): void {
    // Notice: order of binding is critical, eg. the plugins will not work if \
    //   they are applied before Pinia is bound to the app. They need to be \
    //   applied AFTER binding to the app. The same applies to loading tables.

    // #1. Bind to app
    app.use(this.__store);

    // #2. Bind all plugins
    this.__applyPlugins();

    // #3. Load all tables
    this.__loadTables();
  }

  reset(): void {
    // Reset all stores
    for (const [storeName, storeInstance] of Object.entries(this)) {
      if (storeName.startsWith(STORE_KEY_PREFIX) === true) {
        const storeNameNoPrefix = storeName.substring(STORE_KEY_PREFIX.length);

        // Store not ignored? Can reset.
        if (STORE_RESET_IGNORES.includes(storeNameNoPrefix) === false) {
          storeInstance.$reset();
        }
      }
    }
  }

  private __applyPlugins(): void {
    this.__store.use(
      createPersistedState({
        key: id => [STORE_PERSIST_PREFIX, STORE_PERSIST_REVISION, id].join(":"),
        storage: localStorage
      })
    );
  }

  private __loadTables(): void {
    // #1. Transient stores
    this.$session = $session(this.__store);
    this.$history = $history(this.__store);

    // #2. Permanent stores
    this.$layout = $layout(this.__store);
    this.$account = $account(this.__store);
    this.$avatar = $avatar(this.__store);
    this.$profile = $profile(this.__store);
    this.$inbox = $inbox(this.__store);
    this.$roster = $roster(this.__store);
    this.$activity = $activity(this.__store);
    this.$presence = $presence(this.__store);
    this.$settings = $settings(this.__store);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { STORE_PERSIST_PREFIX, STORE_PERSIST_BOOT };
export default new Store();
