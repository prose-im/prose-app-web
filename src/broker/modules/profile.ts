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
import { $iq, Strophe } from "strophe.js";
import xmppID from "@xmpp/id";
import xmppTime from "@xmpp/time";
import {
  BareJID,
  FullJID,
  JID,
  UserProfile,
  Job,
  Address
} from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { NS_VCARD4, NS_LAST, NS_TIME } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const SECOND_TO_MILLISECONDS = 1000; // 1 second

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type SaveVCardRequest = LoadVCardResponse;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface LoadVCardResponse {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  url?: string;
  email?: string;
  phone?: string;
  job?: LoadVCardResponseJob;
  address?: LoadVCardResponseAddress;
}

interface LoadVCardResponseJob {
  title?: string;
  role?: string;
  organization?: string;
}

interface LoadVCardResponseAddress {
  city?: string;
  country?: string;
}

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
 * INSTANCES
 * ************************************************************************* */

const PHONE_URI_REGEX = /^tel:(.+)$/;

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const PHONE_URI_PREFIX = "tel:";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleProfile extends BrokerModule {
  async loadVCard(jid: BareJID): Promise<LoadVCardResponse> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html

    logger.info(`Will load vCard profile for: '${jid}'`);

    return (await this._client.client?.loadUserProfile(jid)) || {};
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

  async saveVCard(jid: JID, vCard: SaveVCardRequest): Promise<void> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html

    logger.info(`Will save vCard profile for: '${jid}'`, vCard);

    const job = new Job();
    job.title = vCard.job?.title;
    job.role = vCard.job?.role;
    job.organization = vCard.job?.organization;

    const address = new Address();
    address.city = vCard.address?.city;
    address.country = vCard.address?.country;

    const profile = new UserProfile();
    profile.fullName = vCard.fullName;
    profile.firstName = vCard.firstName;
    profile.lastName = vCard.lastName;
    profile.url = vCard.url;
    profile.email = vCard.email;
    profile.phone = vCard.phone;

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

  private __makeStanzaVCard(
    stanza: Strophe.Builder,
    vCard: SaveVCardRequest
  ): void {
    const stanzaVCard = stanza.c("vcard", {
      xmlns: NS_VCARD4
    });

    // Append full name
    this.__makeStanzaVCardValue(stanzaVCard, "fn", vCard.fullName);

    // Append name?
    if (vCard.firstName || vCard.lastName) {
      const stanzaVCardName = stanzaVCard.c("n");

      if (vCard.firstName) {
        stanzaVCardName.c("given", {}, vCard.firstName);
      }
      if (vCard.lastName) {
        stanzaVCardName.c("surname", {}, vCard.lastName);
      }

      // Done, go back to root
      stanzaVCardName.up();
    }

    // Append URL, email & phone
    this.__makeStanzaVCardValue(stanzaVCard, "url", vCard.url, "uri");
    this.__makeStanzaVCardValue(stanzaVCard, "email", vCard.email);

    this.__makeStanzaVCardValue(
      stanzaVCard,
      "tel",
      vCard.phone,
      "uri",
      PHONE_URI_PREFIX
    );

    // Append job?
    if (vCard.job) {
      this.__makeStanzaVCardValue(stanzaVCard, "title", vCard.job.title);
      this.__makeStanzaVCardValue(stanzaVCard, "role", vCard.job.role);
      this.__makeStanzaVCardValue(stanzaVCard, "org", vCard.job.organization);
    }

    // Append address?
    if (vCard.address && (vCard.address.city || vCard.address.country)) {
      const stanzaVCardAddress = stanzaVCard.c("adr");

      if (vCard.address.city) {
        stanzaVCardAddress.c("locality", {}, vCard.address.city);
      }
      if (vCard.address.country) {
        stanzaVCardAddress.c("country", {}, vCard.address.country);
      }

      // Done, go back to root
      stanzaVCardAddress.up();
    }
  }

  private __makeStanzaVCardValue(
    stanzaVCard: Strophe.Builder,
    nodeName: string,
    nodeValue: string | undefined,
    wrapperType = "text",
    valuePrefix = ""
  ): void {
    if (nodeValue) {
      stanzaVCard
        .c(nodeName)
        .c(wrapperType, {}, `${valuePrefix}${nodeValue}`)
        .up();
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type {
  LoadVCardResponse,
  LoadLastActivityResponse,
  LoadEntityTimeResponse,
  LoadAvatarDataResponse,
  SaveVCardRequest,
  SaveAvatarRequest
};
export default BrokerModuleProfile;
