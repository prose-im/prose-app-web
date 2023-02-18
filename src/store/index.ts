/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

// PROJECT: STORE
import StoreTableSession from "@/store/tables/session";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const STORE_PERSIST_PREFIX = "prose";
const STORE_PERSIST_REVISION = "1";

/**************************************************************************
 * STORE
 * ************************************************************************* */

const store = createPinia();

/**************************************************************************
 * PLUGINS
 * ************************************************************************* */

store.use(
  createPersistedState({
    key: id => [STORE_PERSIST_PREFIX, STORE_PERSIST_REVISION, id].join(":"),
    storage: localStorage
  })
);

/**************************************************************************
 * TABLES
 * ************************************************************************* */

const $session = StoreTableSession(store);

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default store;

export { $session };
