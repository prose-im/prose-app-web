/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PACKAGE
import * as projectPackage from "@/../package.json";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

export const VERSION_NAME = "Prose";
export const VERSION_SYSTEM = UtilitiesRuntime.acquirePlatformName();
export const VERSION_REVISION = projectPackage.version || "0.0.0";
