/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

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
