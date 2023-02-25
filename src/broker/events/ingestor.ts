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
    // Ingest root (root handler is required)
    this._handlers.root(stanza);

    // Ingest each child
    Strophe.forEachChild(stanza, null, (element: Element) => {
      const namespace = element.getAttribute("xmlns") || null;

      if (namespace !== null) {
        const handler = this._handlers[namespace] || null;

        // Execute handler for namespace?
        if (handler !== null) {
          handler(stanza, element);
        }
      }
    });
  }

  protected abstract _base(stanza: Element): void;
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventIngestor;
