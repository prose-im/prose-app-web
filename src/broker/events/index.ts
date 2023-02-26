/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: BROKER
import BrokerClient from "@/broker/client";
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

  constructor(client: BrokerClient) {
    this.__presence = new BrokerEventPresence(client);
    this.__message = new BrokerEventMessage(client);
    this.__iq = new BrokerEventIQ(client);
  }

  presence(stanza: Element): void {
    // Ingest presence stanza in event broker
    return this.__presence.ingest(stanza);
  }

  message(stanza: Element): void {
    // Ingest message stanza in event broker
    return this.__message.ingest(stanza);
  }

  iq(stanza: Element): void {
    // Ingest IQ stanza in event broker
    return this.__iq.ingest(stanza);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEvent;
