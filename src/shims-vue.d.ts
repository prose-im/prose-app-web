/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Router, MatcherLocation as RouterRoute } from "vue-router";

// PROJECT: BOOTSTRAP
import { Config } from "@/bootstrap/config";
import { Filters } from "@/bootstrap/filters";
import { Styles } from "@/bootstrap/styles";

/**************************************************************************
 * DECLARES
 * ************************************************************************* */

declare module "*.vue" {
  import Vue from "vue";

  export default Vue;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    // Bootstrappers
    $config: Config;
    $filters: Filters;
    $styles: Styles;

    // Vue Router
    $router: Router;
    $route: RouterRoute;
  }
}

export {};
