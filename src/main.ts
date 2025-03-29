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
import { default as proseSDKJS } from "@prose-im/prose-sdk-js";

// PROJECT: STYLES
import "@/assets/stylesheets/all.scss";

// PROJECT: MAIN
import App from "@/App.vue";
import Router from "@/router";
import Store from "@/store";

// PROJECT: BOOTSTRAP
import "@/bootstrap/icons";
import "@/bootstrap/features";

import BootstrapConfig from "@/bootstrap/config";
import BootstrapStyles from "@/bootstrap/styles";
import BootstrapFilters from "@/bootstrap/filters";
import BootstrapComponents from "@/bootstrap/components";
import BootstrapPlugins from "@/bootstrap/plugins";

/**************************************************************************
 * DEPENDENCIES
 * ************************************************************************* */

await proseSDKJS();

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const app = createApp(App);

/**************************************************************************
 * PLUGINS
 * ************************************************************************* */

Store.bind(app);
Router.bind(app);

/**************************************************************************
 * BOOTSTRAP
 * ************************************************************************* */

BootstrapConfig.init(app);
BootstrapStyles.init(app);
BootstrapFilters.init(app);
BootstrapComponents.init(app);
BootstrapPlugins.init(app);

/**************************************************************************
 * INITIALIZE
 * ************************************************************************* */

app.mount("#runtime");
