import { BareJID, FullJID, JID } from "@prose-im/prose-core-client-wasm";

function isBareJID(jid: JID): jid is { bare: BareJID; free(): void } {
  return jid.bare !== undefined;
}

function isFullJID(jid: JID): jid is { full: FullJID; free(): void } {
  return jid.full !== undefined;
}

function toJID(jid: FullJID | BareJID): JID {
  if (jid instanceof FullJID) {
    return JID.withFull(jid);
  } else {
    return JID.withBare(jid);
  }
}

export { isBareJID, isFullJID, toJID };
