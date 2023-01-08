/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { createApp } from "vue";

// PROJECT: STYLES
import "./assets/stylesheets/all.scss";

// PROJECT: MAIN
import App from "./App.vue";
import router from "./router";

// PROJECT: BOOTSTRAP
import Components from "./bootstrap/components";

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const app = createApp(App);

app.use(router);

/**************************************************************************
 * BOOTSTRAP
 * ************************************************************************* */

Components.init(app);

/**************************************************************************
 * INITIALIZE
 * ************************************************************************* */

app.mount("#app");
