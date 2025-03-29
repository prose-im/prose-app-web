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

// PROJECT: FILTERS
import dateFilters from "@/filters/date";
import stringFilters from "@/filters/string";
import colorFilters from "@/filters/color";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Filters {
  date: typeof dateFilters;
  string: typeof stringFilters;
  color: typeof colorFilters;
}

/**************************************************************************
 * FILTERS
 * ************************************************************************* */

class BootstrapFilters {
  init(app: App): void {
    app.config.globalProperties.$filters = {
      date: dateFilters,
      string: stringFilters,
      color: colorFilters
    } as Filters;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { Filters };
export default new BootstrapFilters();
