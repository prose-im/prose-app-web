/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 ***************************************************************************/

// NPM
import upperFirst from "lodash.upperfirst";
import camelCase from "lodash.camelcase";

/**************************************************************************
 * COMPONENTS
 ***************************************************************************/

class Components {
  /**
   * Initializer
   * @param  {object} app
   * @return {undefined}
   */
  init(app) {
    this.registerGlobally(
      app, import.meta.globEager("/src/components/base/*.vue")
    );
  }

  /**
   * Registers component globally
   * @param  {object}   app
   * @param  {function} componentFiles
   * @return {undefined}
   */
  registerGlobally(app, componentFiles) {
    Object.entries(componentFiles).forEach(
      ([componentPath, componentModule]) => {
        // Get PascalCase name of component
        const componentName = upperFirst(
          camelCase(
            componentPath.split("/").pop().replace(/^(.+)\.vue$/, "$1")
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
 ***************************************************************************/

export default new Components();
