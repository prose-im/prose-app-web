/*
 * This file is part of prose-app-web
 *
 * Copyright 2025, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import hexRgb from "hex-rgb";
import colorMix from "mix-css-color";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type ColorHex = string;
type ColorVar = string;

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RATIO_TO_PERCENT = 100; // 100%

const COLOR_MIX_COLOR_BLACK = "black";
const COLOR_MIX_CORRECTIVE_FACTOR = 1.75;

/**************************************************************************
 * FILTERS
 ***************************************************************************/

class FilterColor {
  hexVar(hex: ColorHex): ColorVar {
    // Convert hexadecimal to RGB, and return CSS-compatible 'R, G, B' \
    //   format, equivalent to the return value of the 'hex-var()' global \
    //   SCSS function.
    return hexRgb(hex, {
      format: "array"
    })
      .slice(0, 3)
      .join(", ");
  }

  darkenVar(hex: ColorHex, ratio: number): ColorVar {
    // Convert hexadecimal to darkened RGB, and return CSS-compatible \
    //   'R, G, B' format, equivalent to the return value of the \
    //   'darken-var()' global SCSS function.
    // Notice: apply a corrective factor to the percent so that it looks \
    //   almost like SCSS darken() function.
    const mixedColor = colorMix(
      COLOR_MIX_COLOR_BLACK,
      hex,
      ratio * RATIO_TO_PERCENT * COLOR_MIX_CORRECTIVE_FACTOR
    );

    return this.hexVar(mixedColor.hex);
  }
}

/**************************************************************************
 * EXPORTS
 ***************************************************************************/

export default new FilterColor();
