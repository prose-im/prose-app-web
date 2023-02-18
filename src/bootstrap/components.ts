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
import upperFirst from "lodash.upperfirst";
import camelCase from "lodash.camelcase";

/**************************************************************************
 * COMPONENTS
 * ************************************************************************* */

class BootstrapComponents {
  init(app: App): void {
    this.__registerGlobally(
      app,
      import.meta.globEager("@/components/(base|form|list|layout|tool)/*.vue")
    );
  }

  private __registerGlobally(app: App, componentFiles: object): void {
    Object.entries(componentFiles).forEach(
      ([componentPath, componentModule]) => {
        // Get PascalCase name of component
        const componentName = upperFirst(
          camelCase(
            componentPath
              .split("/")
              .pop()
              .replace(/^(.+)\.vue$/, "$1")
          )
        );

        // Register component globally
        app.component(componentName, componentModule.default);
      }
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BootstrapComponents();
