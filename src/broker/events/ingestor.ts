/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Strophe } from "strophe.js";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

abstract class BrokerEventIngestor {
  protected abstract _handlers: {
    [namespace: string]: (stanza: Element, element?: Element) => void;
  };

  ingest(stanza: Element): void {
    let _wasHandled = false;

    // Ingest anything (if any)
    const anyHandlerFn = this._handlers.any || null;

    if (anyHandlerFn !== null) {
      anyHandlerFn(stanza);

      // Mark as handled
      _wasHandled = true;
    }

    // Ingest each child
    Strophe.forEachChild(stanza, null, (element: Element) => {
      const namespace = element.getAttribute("xmlns") || null;

      if (namespace !== null) {
        const childHandlerFn = this._handlers[namespace] || null;

        // Execute handler for namespace?
        if (childHandlerFn !== null) {
          childHandlerFn(stanza, element);

          // Mark as handled
          _wasHandled = true;
        }
      }
    });

    // Trigger other handler? (if any, and was not handled)
    if (_wasHandled !== true) {
      const otherHandlerFn = this._handlers.other || null;

      if (otherHandlerFn !== null) {
        otherHandlerFn(stanza);
      }
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventIngestor;
