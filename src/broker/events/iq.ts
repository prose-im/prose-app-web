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
import xmppTime from "@xmpp/time";

// PACKAGE
import * as projectPackage from "/package.json";

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";
import { IQType } from "@/broker/stanzas/iq";
import {
  NS_CLIENT,
  NS_STANZAS,
  NS_VERSION,
  NS_LAST,
  NS_ROSTER,
  NS_DISCO_INFO,
  NS_TIME,
  NS_PING
} from "@/broker/stanzas/xmlns";
import * as xmlns from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const DISCO_FEATURES = Object.entries(xmlns)
  .filter(([namespaceName, _]) => {
    return namespaceName.startsWith("NS_");
  })
  .map(([_, namespaceValue]) => {
    return namespaceValue;
  })
  .sort();

const DISCO_CATEGORY = "client";
const DISCO_TYPE = "web";
const DISCO_NAME = "Prose";

const VERSION_NAME = DISCO_NAME;
const VERSION_SYSTEM = "Web";
const VERSION_REVISION_FALLBACK = "0.0.0";

const ERROR_FEATURE_NOT_IMPLEMENTED_TEXT =
  "The feature requested is not implemented by the recipient or server and " +
  "therefore cannot be processed.";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventIQ extends BrokerEventIngestor {
  protected _handlers = {
    assert: this.__assert,
    [NS_VERSION]: this.__version,
    [NS_LAST]: this.__last,
    [NS_ROSTER]: this.__roster,
    [NS_DISCO_INFO]: this.__discoInfo,
    [NS_TIME]: this.__time,
    [NS_PING]: this.__ping,
    other: this.__other
  };

  private __assert(stanza: Element): boolean {
    // Do not handle non-request IQs
    const kind = stanza.getAttribute("type");

    if (kind === IQType.Error) {
      // Log error
      logger.warn(
        `Received error IQ from: '${
          stanza.getAttribute("from") || ""
        }' with text:`,
        stanza.querySelector("error text")?.textContent
      );

      // Do not route
      return false;
    }

    if (kind !== IQType.Get && kind !== IQType.Set) {
      logger.info(
        `Ignoring IQ from: '${
          stanza.getAttribute("from") || ""
        }' as it is not 'get' or 'set'`
      );

      // Do not route
      return false;
    }

    logger.info(`Processing IQ from: '${stanza.getAttribute("from") || ""}'`);

    // Do route
    return true;
  }

  private __version(stanza: Element, element: Element): void {
    // XEP-0092: Software Version
    // https://xmpp.org/extensions/xep-0092.html

    this.__respondTo(stanza, response => {
      // Read application version
      const appVersion = projectPackage.version || VERSION_REVISION_FALLBACK;

      // Append query response
      const responseQuery = response.c("query", { xmlns: NS_VERSION });

      responseQuery.c("name", {}, VERSION_NAME);
      responseQuery.c("version", {}, appVersion);
      responseQuery.c("os", {}, VERSION_SYSTEM);
    });
  }

  private __last(stanza: Element, element: Element): void {
    // XEP-0012: Last Activity
    // https://xmpp.org/extensions/xep-0012.html

    this.__respondTo(stanza, response => {
      // TODO: add dynamic data
      const lastActiveSeconds = 0;

      // Append query response
      response.c("query", { xmlns: NS_LAST, seconds: lastActiveSeconds });
    });
  }

  private __roster(stanza: Element, element: Element): void {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-push

    this.__respondTo(stanza, () => {
      // TODO: handle and do not respond
    });
  }

  private __discoInfo(stanza: Element, element: Element): void {
    // XEP-0030: Service Discovery
    // https://xmpp.org/extensions/xep-0030.html

    this.__respondTo(stanza, response => {
      // Append query response
      const responseQuery = response.c("query", { xmlns: NS_DISCO_INFO });

      responseQuery.c("identity", {
        category: DISCO_CATEGORY,
        type: DISCO_TYPE,
        name: DISCO_NAME
      });

      DISCO_FEATURES.forEach(featureNamespace => {
        responseQuery.c("feature", { var: featureNamespace });
      });
    });
  }

  private __time(stanza: Element, element: Element): void {
    // XEP-0202: Entity Time
    // https://xmpp.org/extensions/xep-0202.html

    this.__respondTo(stanza, response => {
      const nowDate = new Date();

      // Append time response
      const responseTime = response.c("time", { xmlns: NS_TIME });

      responseTime.c("tzo", {}, xmppTime.offset(nowDate));
      responseTime.c("utc", {}, xmppTime.datetime(nowDate));
    });
  }

  private __ping(stanza: Element, element: Element): void {
    // XEP-0199: XMPP Ping
    // https://xmpp.org/extensions/xep-0199.html

    this.__respondTo(stanza, () => {
      logger.debug("Got ping request");
    });
  }

  private __other(stanza: Element): void {
    this.__respondTo(
      stanza,

      response => {
        // Append original stanza content
        Strophe.forEachChild(stanza, null, (element: Element) => {
          response.cnode(Strophe.copyElement(element));
        });

        // Append error content
        response
          .c("error", { xmlns: NS_CLIENT, code: "501", type: "cancel" })
          .c("feature-not-implemented", { xmlns: NS_STANZAS })
          .up()
          .c("text", { xmlns: NS_STANZAS }, ERROR_FEATURE_NOT_IMPLEMENTED_TEXT);

        logger.warn(
          `Sending unsupported IQ error to: '${
            stanza.getAttribute("from") || ""
          }'`
        );
      },

      IQType.Error
    );
  }

  private __respondTo(
    stanza: Element,
    respondFn?: (response: Strophe.Builder) => void,
    kind: IQType = IQType.Result
  ): void {
    // TODO: limit on get/set type, and send back an error code if mismatch

    // Craft response IQ
    const response = $iq({
      type: kind,
      id: stanza.getAttribute("id") || "",
      to: stanza.getAttribute("from") || ""
    });

    // Pass builder to respond function? (if any)
    if (respondFn !== undefined) {
      respondFn(response);
    }

    // Emit response stanza
    this._client.emit(response);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventIQ;
