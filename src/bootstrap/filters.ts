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

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Filters {
  date: typeof dateFilters;
}

/**************************************************************************
 * FILTERS
 * ************************************************************************* */

class BootstrapFilters {
  init(app: App): void {
    app.config.globalProperties.$filters = {
      date: dateFilters
    } as Filters;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { Filters };
export default new BootstrapFilters();
