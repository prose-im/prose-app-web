/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: FILTERS
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
    $config: Config;
    $filters: Filters;
    $styles: Styles;
  }
}

export {};
