/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Cash } from "cash-dom";
import { $iq } from "strophe.js";
import xmppID from "@xmpp/id";
import xmppTime from "@xmpp/time";
import {
  BareJID,
  FullJID,
  JID,
  UserProfile
} from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { NS_LAST, NS_TIME } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const SECOND_TO_MILLISECONDS = 1000; // 1 second

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface LoadLastActivityResponse {
  timestamp: number;
  text?: string;
}

interface LoadEntityTimeResponse {
  tzo: string;
  utc: string;
}

interface LoadAvatarDataResponse {
  dataURL: string;
}

interface SaveAvatarRequest {
  data: SaveAvatarRequestData;
  metadata: SaveAvatarRequestMetadata;
}

interface SaveAvatarRequestData {
  binary: string;
  base64: string;
}

interface SaveAvatarRequestMetadata {
  type: string;
  bytes: number;
  height?: number;
  width?: number;
}

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleProfile extends BrokerModule {
  async loadVCard(jid: BareJID): Promise<UserProfile | undefined> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html

    logger.info(`Will load vCard profile for: '${jid}'`);

    return await this._client.client?.loadUserProfile(jid);
  }

  async loadLastActivity(fullJID: FullJID): Promise<LoadLastActivityResponse> {
    // XEP-0012: Last Activity
    // https://xmpp.org/extensions/xep-0012.html

    logger.info(`Will load last activity for: '${fullJID}'`);

    const response = await this._client.request(
      $iq({ to: fullJID, type: IQType.Get, id: xmppID() }).c("query", {
        xmlns: NS_LAST
      })
    );

    return this.__respondLoadLastActivity(response);
  }

  async loadEntityTime(fullJID: FullJID): Promise<LoadEntityTimeResponse> {
    // XEP-0202: Entity Time
    // https://xmpp.org/extensions/xep-0202.html

    logger.info(`Will load entity time for: '${fullJID}'`);

    const response = await this._client.request(
      $iq({ to: fullJID, type: IQType.Get, id: xmppID() }).c("time", {
        xmlns: NS_TIME
      })
    );

    return this.__respondLoadEntityTime(response);
  }

  async loadAvatarData(jid: BareJID): Promise<LoadAvatarDataResponse | void> {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html

    logger.info(`Will load avatar for: '${jid}'`);

    let dataURL = await this._client.client?.loadAvatarDataURL(jid);
    if (dataURL) {
      return { dataURL };
    }

    return undefined;
  }

  async saveVCard(jid: JID, profile: UserProfile): Promise<void> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html

    logger.info(`Will save vCard profile for: '${jid}'`, profile);
    await this._client.client?.saveUserProfile(profile);
  }

  async saveAvatar(jid: JID, avatar: SaveAvatarRequest): Promise<void> {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html

    logger.info(`Will save avatar for: '${jid}'`);
    await this._client.client?.saveAvatar(
      avatar.data.base64,
      avatar.metadata.type
    );
  }

  private __respondLoadLastActivity(response: Cash): LoadLastActivityResponse {
    const queryElement = response.find("query").first();

    // Read seconds count (as timestamp)
    return {
      timestamp:
        Date.now() -
        parseInt(queryElement.attr("seconds") || "0") * SECOND_TO_MILLISECONDS,
      text: queryElement.text() || undefined
    };
  }

  private __respondLoadEntityTime(response: Cash): LoadEntityTimeResponse {
    const timeElement = response.find("time").first();

    // Read time data (or fallback to local time)
    return {
      tzo: timeElement.find("tzo").text() || xmppTime.offset(),
      utc: timeElement.find("utc").text() || xmppTime.datetime()
    };
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type {
  LoadLastActivityResponse,
  LoadEntityTimeResponse,
  LoadAvatarDataResponse,
  SaveAvatarRequest
};
export default BrokerModuleProfile;
