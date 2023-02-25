/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: BROKER
import BrokerEventPresence from "@/broker/events/presence";
import BrokerEventMessage from "@/broker/events/message";
import BrokerEventIQ from "@/broker/events/iq";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEvent {
  private readonly __presence: BrokerEventPresence;
  private readonly __message: BrokerEventMessage;
  private readonly __iq: BrokerEventIQ;

  constructor() {
    this.__presence = new BrokerEventPresence();
    this.__message = new BrokerEventMessage();
    this.__iq = new BrokerEventIQ();
  }

  presence(stanza: Element): void {
    return this.__presence.ingest(stanza);
  }

  message(stanza: Element): void {
    return this.__message.ingest(stanza);
  }

  iq(stanza: Element): void {
    return this.__iq.ingest(stanza);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEvent;
