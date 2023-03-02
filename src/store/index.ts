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
import { Pinia, Store as PiniaStore, createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

// PROJECT: STORE
import { Account, $account } from "@/store/tables/account";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const STORE_PERSIST_PREFIX = "prose";
const STORE_PERSIST_REVISION = "v1";

/**************************************************************************
 * STORE
 * ************************************************************************* */

class Store {
  private readonly __store: Pinia;

  // @ts-expect-error $account will be definitely initialized
  $account: PiniaStore<"account", Account, any, any>;

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

  private __applyPlugins(): void {
    this.__store.use(
      createPersistedState({
        key: id => [STORE_PERSIST_PREFIX, STORE_PERSIST_REVISION, id].join(":"),
        storage: localStorage
      })
    );
  }

  private __loadTables(): void {
    this.$account = $account(this.__store);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Store();
