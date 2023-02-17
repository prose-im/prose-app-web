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
 * STORE
 * ************************************************************************* */

const store = createPinia();

/**************************************************************************
 * PLUGINS
 * ************************************************************************* */

store.use(
  createPersistedState({
    key: id => `$prose_${id}`,
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
