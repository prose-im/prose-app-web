import { BareJID, FullJID, JID } from "@prose-im/prose-core-client-wasm";

function isBareJID(jid: JID): jid is { bare: BareJID; free(): void } {
  return jid.bare !== undefined;
}

function isFullJID(jid: JID): jid is { full: FullJID; free(): void } {
  return jid.full !== undefined;
}

export { isBareJID, isFullJID };
