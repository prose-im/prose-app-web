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
import "@/assets/stylesheets/all.scss";

// PROJECT: MAIN
import App from "@/App.vue";
import Router from "@/router";
import Store from "@/store";

// PROJECT: BOOTSTRAP
import "@/bootstrap/icons";

import BootstrapConfig from "@/bootstrap/config";
import BootstrapComponents from "@/bootstrap/components";
import BootstrapPlugins from "@/bootstrap/plugins";

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const app = createApp(App);

/**************************************************************************
 * PLUGINS
 * ************************************************************************* */

Router.bind(app);
Store.bind(app);

/**************************************************************************
 * BOOTSTRAP
 * ************************************************************************* */

BootstrapConfig.init(app);
BootstrapComponents.init(app);
BootstrapPlugins.init(app);

/**************************************************************************
 * INITIALIZE
 * ************************************************************************* */

app.mount("#app");
