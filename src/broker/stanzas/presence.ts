/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

export enum PresenceType {
  // Signals that the entity is no longer available for communication.
  Unavailable = "unavailable",
  // The sender wishes to subscribe to the recipient's presence.
  Subscribe = "subscribe",
  // The sender has allowed the recipient to receive their presence.
  Subscribed = "subscribed",
  // The sender is unsubscribing from another entity's presence.
  Unsubscribe = "unsubscribe",
  // The subscription request has been denied or a previously-granted \
  //   subscription has been cancelled.
  Unsubscribed = "unsubscribed",
  // A request for an entity's current presence; SHOULD be generated only by a \
  //   server on behalf of a user.
  Probe = "probe",
  // An error has occurred regarding processing or delivery of a \
  //   previously-sent presence stanza.
  Error = "error"
}

export enum PresenceShow {
  // The entity or resource is temporarily away.
  Away = "away",
  // The entity or resource is actively interested in chatting.
  Chat = "chat",
  // The entity or resource is busy (dnd = "Do Not Disturb").
  DND = "dnd",
  // The entity or resource is away for an extended period (xa = "eXtended \
  //   Away").
  XA = "xa"
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

export const CAPS_NODE = "https://prose.org";
