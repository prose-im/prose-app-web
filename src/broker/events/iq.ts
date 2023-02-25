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
import {
  NS_VERSION,
  NS_LAST,
  NS_ROSTER,
  NS_DISCO_INFO,
  NS_TIME,
  NS_PING
} from "@/broker/stanzas/xmlns";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventIQ extends BrokerEventIngestor {
  // TODO: ANY IQ should be replied-to, w/ an error as a fallback

  protected _handlers = {
    [NS_VERSION]: this.__version,
    [NS_LAST]: this.__last,
    [NS_ROSTER]: this.__roster,
    [NS_DISCO_INFO]: this.__discoInfo,
    [NS_TIME]: this.__time,
    [NS_PING]: this.__ping,
    other: this.__other
  };

  private __version(stanza: Element, element: Element): void {
    // XEP-0092: Software Version
    // https://xmpp.org/extensions/xep-0092.html

    // TODO
    console.error("==> event : iq : got software version query", element);
  }

  private __last(stanza: Element, element: Element): void {
    // XEP-0012: Last Activity
    // https://xmpp.org/extensions/xep-0012.html

    // TODO
    console.error("==> event : iq : got last activity query", element);
  }

  private __roster(stanza: Element, element: Element): void {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-push

    // TODO
    console.error("==> event : iq : got roster push", element);
  }

  private __discoInfo(stanza: Element, element: Element): void {
    // XEP-0030: Service Discovery
    // https://xmpp.org/extensions/xep-0030.html

    // TODO
    console.error("==> event : iq : got disco info query", element);
  }

  private __time(stanza: Element, element: Element): void {
    // XEP-0202: Entity Time
    // https://xmpp.org/extensions/xep-0202.html

    // TODO
    console.error("==> event : iq : got user time query", element);
  }

  private __ping(stanza: Element, element: Element): void {
    // XEP-0199: XMPP Ping
    // https://xmpp.org/extensions/xep-0199.html

    // TODO
    console.error("==> event : iq : got ping query", element);
  }

  private __other(stanza: Element): void {
    // TODO: raise other error

    // TODO
    console.error("==> event : iq : got other", stanza);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventIQ;
