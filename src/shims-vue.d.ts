/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: FILTERS
import { Filters } from "@/bootstrap/filters";

/**************************************************************************
 * DECLARES
 * ************************************************************************* */

declare module "*.vue" {
  import Vue from "vue";

  export default Vue;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $filters: Filters;
  }
}

export {};
