/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: BROKER
import * as xmlns from "@/broker/stanzas/xmlns";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

export enum IQType {
  // The stanza requests information, inquires about what data is needed in \
  //   order to complete further operations, etc.
  Get = "get",
  // The stanza provides data that is needed for an operation to be completed, \
  //   sets new values, replaces existing values, etc.
  Set = "set",
  // The stanza is a response to a successful get or set request.
  Result = "result",
  // The stanza reports an error that has occurred regarding processing or \
  //   delivery of a get or set request.
  Error = "error"
}

export enum IQRosterSubscription {
  // The user does not have a subscription to the contact's presence, and the \
  //   contact does not have a subscription to the user's presence; this is \
  //   the default value, so if the subscription attribute is not included \
  //   then the state is to be understood as "none".
  None = "none",
  // The user has a subscription to the contact's presence, but the contact \
  //   does not have a subscription to the user's presence.
  To = "to",
  // The contact has a subscription to the user's presence, but the user does \
  //   not have a subscription to the contact's presence.
  From = "from",
  // The user and the contact have subscriptions to each other's presence \
  //   (also called a "mutual subscription").
  Both = "both"
}

export enum IQRosterAsk {
  // The 'ask' attribute of the <item/> element with a value of "subscribe" \
  //   is used to signal various subscription sub-states.
  Subscribe = "subscribe"
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

export const DISCO_FEATURES = Object.entries(xmlns)
  .filter(([namespaceName]) => {
    return namespaceName.startsWith("NS_");
  })
  .map(([, namespaceValue]) => {
    return namespaceValue;
  })
  .sort();

export const DISCO_CATEGORY = "client";
export const DISCO_TYPE = "web";
export const DISCO_NAME = "Prose";
export const DISCO_XML_LANG = "en";

export const VERSION_NAME = DISCO_NAME;
export const VERSION_SYSTEM = "Web";
export const VERSION_REVISION_FALLBACK = "0.0.0";
