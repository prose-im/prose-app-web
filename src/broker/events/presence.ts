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

class BrokerEventPresence extends BrokerEventIngestor {
  protected _handlers = {};
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventPresence;
