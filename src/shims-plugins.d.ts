/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * DECLARES
 * ************************************************************************* */

declare module "v-hotkey" {
  import { DirectiveOptions, PluginFunction } from "vue";

  type Plugin = {
    install: PluginFunction<{ [alias in string]?: number }>;
    directive: DirectiveOptions;
  };

  const plugin: Plugin;

  export default plugin;
}
