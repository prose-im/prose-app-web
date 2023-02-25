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
