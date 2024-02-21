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
import { checkText as textSmilesToEmojis } from "smile2emoji";

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
 * CONSTANTS
 * ************************************************************************* */

const SPACE_CHARACTER = " ";

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

  replaceLastSmileyToEmoji(text: StringText): StringText | null {
    // Require a non-empty text ending with a space (do not replace if the \
    //   user did not finish typing eg. their textual smile)
    if (text && text.endsWith(SPACE_CHARACTER) === true) {
      // Extract last word from text (in the most efficient way)
      // Notice: we will not be calling 'textSmilesToEmojis' on the whole \
      //   text, since it would split the text in words and attempt \
      //   to replace every single word to an emoji, which could be heavy \
      //   on large texts. Rather, we attempt the replacement on the last \
      //   word that was typed only, and then merge it with the text if, \
      //   and only if, an emoji replacement occurred.
      const textNoEndSpace = text.trimEnd(),
        lastWordSpace = textNoEndSpace.lastIndexOf(SPACE_CHARACTER);

      // Acquire text from last word (this includes the trailing spaces)
      const lastWordText = text.substring(
        lastWordSpace + SPACE_CHARACTER.length
      );

      // Attempt to replace smiles to emojis (in last typed word)
      const replacedLastWordText = textSmilesToEmojis(lastWordText);

      // Any emoji replaced in last word? Return whole replaced text
      if (lastWordText !== replacedLastWordText) {
        // Merge replaced last word with original text
        const updatedText =
          text.substring(0, lastWordSpace + SPACE_CHARACTER.length) +
          replacedLastWordText;

        return updatedText;
      }
    }

    return null;
  }
}

/**************************************************************************
 * EXPORTS
 ***************************************************************************/

export default new FilterString();
