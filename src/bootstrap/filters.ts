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
 * FILTERS
 * ************************************************************************* */

class BootstrapFilters {
  init(app: App): void {
    app.config.globalProperties.$filters = {
      date: dateFilters
    };
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BootstrapFilters();
