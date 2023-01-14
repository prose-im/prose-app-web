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
import BootstrapComponents from "./bootstrap/components";
import BootstrapPlugins from "./bootstrap/plugins";

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const app = createApp(App);

app.use(router);

/**************************************************************************
 * BOOTSTRAP
 * ************************************************************************* */

BootstrapComponents.init(app);
BootstrapPlugins.init(app);

/**************************************************************************
 * INITIALIZE
 * ************************************************************************* */

app.mount("#app");
