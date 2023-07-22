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
import { JID } from "@xmpp/jid";
import sha1 from "crypto-js/sha1";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import {
  NS_VCARD4,
  NS_LAST,
  NS_TIME,
  NS_AVATAR_DATA,
  NS_AVATAR_METADATA,
  NS_PUBSUB
} from "@/broker/stanzas/xmlns";

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
  encoding: string;
  data: string;
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
  async loadVCard(jid: JID): Promise<LoadVCardResponse> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html

    logger.info(`Will load vCard profile for: '${jid}'`);

    const response = await this._client.request(
      $iq({ to: jid, type: IQType.Get, id: xmppID() }).c("vcard", {
        xmlns: NS_VCARD4
      })
    );

    return this.__respondLoadVCard(response);
  }

  async loadLastActivity(fullJID: JID): Promise<LoadLastActivityResponse> {
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

  async loadEntityTime(fullJID: JID): Promise<LoadEntityTimeResponse> {
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

  async loadAvatarData(
    jid: JID,
    id: string
  ): Promise<LoadAvatarDataResponse | void> {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html

    logger.info(`Will load avatar for: '${jid}'`);

    const response = await this._client.request(
      $iq({ to: jid, type: IQType.Get, id: xmppID() })
        .c("pubsub", { xmlns: NS_PUBSUB })
        .c("items", { node: NS_AVATAR_DATA })
        .c("item", { id })
    );

    return this.__respondLoadAvatarData(response);
  }

  async saveVCard(jid: JID, vCard: SaveVCardRequest): Promise<void> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html

    logger.info(`Will save vCard profile for: '${jid}'`, vCard);

    const stanza = $iq({ to: jid, type: IQType.Set, id: xmppID() });

    // Make vCard element and append to stanza
    this.__makeStanzaVCard(stanza, vCard);

    await this._client.request(stanza);
  }

  async saveAvatar(jid: JID, avatar: SaveAvatarRequest): Promise<void> {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html

    logger.info(`Will save avatar for: '${jid}'`);

    // #1. Compute stable SHA-1 of avatar data (from binary)
    const id = sha1(avatar.data.binary);

    // #2. Publish avatar data to PEP node
    await this._client.request(
      $iq({ to: jid, type: IQType.Set, id: xmppID() })
        .c("pubsub", { xmlns: NS_PUBSUB })
        .c("publish", { node: NS_AVATAR_DATA })
        .c("item", { id })
        .c("data", { xmlns: NS_AVATAR_DATA }, avatar.data.base64)
    );

    // #3. Publish avatar metadata to PEP node
    await this._client.request(
      $iq({ to: jid, type: IQType.Set, id: xmppID() })
        .c("pubsub", { xmlns: NS_PUBSUB })
        .c("publish", { node: NS_AVATAR_METADATA })
        .c("item", { id })
        .c("metadata", { xmlns: NS_AVATAR_METADATA })
        .c("info", {
          id: id,
          type: avatar.metadata.type,
          bytes: avatar.metadata.bytes,
          height: avatar.metadata.height,
          width: avatar.metadata.width
        })
    );
  }

  private __respondLoadVCard(response: Cash): LoadVCardResponse {
    const responseData: LoadVCardResponse = {};

    const vCardElement = response.find("vcard").first();

    // Append name data
    responseData.fullName = vCardElement.find("fn text").text() || undefined;
    responseData.firstName = vCardElement.find("n given").text() || undefined;
    responseData.lastName = vCardElement.find("n surname").text() || undefined;

    // Append contact data
    responseData.url = vCardElement.find("url uri").text() || undefined;
    responseData.email = vCardElement.find("email text").text() || undefined;

    // Acquire phone URI
    const phoneURI = vCardElement.find("tel uri").text();

    if (phoneURI) {
      const phoneURIMatch = phoneURI.match(PHONE_URI_REGEX);

      if (phoneURIMatch && phoneURIMatch[1]) {
        responseData.phone = phoneURIMatch[1];
      }
    }

    // Append job data
    const jobTitle = vCardElement.find("title text").text(),
      jobRole = vCardElement.find("role text").text(),
      jobOrganization = vCardElement.find("org text").text();

    if (jobTitle || jobRole || jobOrganization) {
      responseData.job = {
        title: jobTitle || undefined,
        role: jobRole || undefined,
        organization: jobOrganization || undefined
      };
    }

    // Append address data
    const vCardAddressElement = vCardElement.find("adr").first();

    const addressLocality = vCardAddressElement.find("locality").text(),
      addressCountry = vCardAddressElement.find("country").text();

    if (addressLocality || addressCountry) {
      responseData.address = {
        city: addressLocality || undefined,
        country: addressCountry || undefined
      };
    }

    return responseData;
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

  private __respondLoadAvatarData(
    response: Cash
  ): LoadAvatarDataResponse | void {
    const dataElement = response.find("pubsub items item data").first();

    if (dataElement.length > 0) {
      return {
        encoding: "base64",
        data: dataElement.text()
      };
    }

    return undefined;
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
