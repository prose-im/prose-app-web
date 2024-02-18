/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import escapeHtml from "escape-html";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type StringText = string;
type StringHTML = string;

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const TEXT_TO_MULTI_LINE_REGEX = /\n/g;

/**************************************************************************
 * FILTERS
 ***************************************************************************/

class FilterString {
  textIntoHtml(text: StringText): StringHTML {
    return escapeHtml(text);
  }

  textIntoMultiLineHtml(text: StringText): StringHTML {
    // Important: escape HTML tags from text before processing, failure to do \
    //   so WILL lead to XSS injections.
    return this.textIntoHtml(text).replace(TEXT_TO_MULTI_LINE_REGEX, "<br>");
  }
}

/**************************************************************************
 * EXPORTS
 ***************************************************************************/

export default new FilterString();
