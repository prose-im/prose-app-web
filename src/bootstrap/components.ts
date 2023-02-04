/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import upperFirst from "lodash.upperfirst";
import camelCase from "lodash.camelcase";

/**************************************************************************
 * COMPONENTS
 * ************************************************************************* */

class BootstrapComponents {
  init(app: object): void {
    this.registerGlobally(
      app,
      import.meta.globEager("@/components/(base|form|list|layout)/*.vue")
    );
  }

  registerGlobally(app: object, componentFiles: object): void {
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
