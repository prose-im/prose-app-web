/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventIQ extends BrokerEventIngestor {
  protected _handlers = {
    root: this.__root
  };

  private __root(stanza: Element): void {
    // TODO
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventIQ;
