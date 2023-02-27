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

// PROJECT: BROKER
import BrokerClient from "@/broker/client";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

abstract class BrokerEventIngestor {
  protected readonly _client: BrokerClient;

  protected abstract _handlers: {
    [namespace: string]: (stanza: Element, element?: Element) => void | boolean;
  };

  constructor(client: BrokerClient) {
    this._client = client;
  }

  ingest(stanza: Element): void {
    // Assert guard before handling? (if any)
    if (
      this._handlers.assert !== undefined &&
      this._handlers.assert.bind(this)(stanza) !== true
    ) {
      // Ignore stanza (assert guard returned false)
      return;
    }

    // Proceed with handling stanza
    let _wasHandled = false;

    // Ingest anything (if any)
    if (this._handlers.any !== undefined) {
      this._handlers.any.bind(this)(stanza);

      // Mark as handled
      _wasHandled = true;
    }

    // Ingest each child
    Strophe.forEachChild(stanza, null, (element: Element) => {
      const namespace = element.getAttribute("xmlns") || null;

      if (namespace !== null) {
        const childHandlerFn = this._handlers[namespace] || undefined;

        // Execute handler for namespace?
        if (childHandlerFn !== undefined) {
          childHandlerFn.bind(this)(stanza, element);

          // Mark as handled
          _wasHandled = true;
        }
      }
    });

    // Trigger other handler? (if any, and was not handled)
    if (_wasHandled !== true && this._handlers.other !== undefined) {
      this._handlers.other.bind(this)(stanza);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventIngestor;
