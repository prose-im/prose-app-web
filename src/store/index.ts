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
import StoreTableAccount from "@/store/tables/account";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const STORE_PERSIST_PREFIX = "prose";
const STORE_PERSIST_REVISION = "v1";

/**************************************************************************
 * STORE
 * ************************************************************************* */

class Store {
  private __store: Pinia;

  $account?: StoreTableAccount;

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
    this.applyPlugins();

    // #3. Load all tables
    this.loadTables();
  }

  applyPlugins(): void {
    this.__store.use(
      createPersistedState({
        key: id => [STORE_PERSIST_PREFIX, STORE_PERSIST_REVISION, id].join(":"),
        storage: localStorage
      })
    );
  }

  loadTables(): void {
    this.$account = StoreTableAccount(this.__store);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Store();
