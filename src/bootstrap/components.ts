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

      import.meta.glob("@/components/(base|form|list|layout|tool)/*.vue", {
        eager: true
      })
    );
  }

  private __registerGlobally(app: App, componentFiles: object): void {
    Object.entries(componentFiles).forEach(
      ([componentPath, componentModule]) => {
        // Acquire file name from component path
        const componentFileName = componentPath.split("/").pop();

        if (componentFileName) {
          // Get PascalCase name of component
          const componentName = upperFirst(
            camelCase(componentFileName.replace(/^(.+)\.vue$/, "$1"))
          );

          // Register component globally
          app.component(componentName, componentModule.default);
        }
      }
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BootstrapComponents();
