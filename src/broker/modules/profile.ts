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
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { NS_VCARD4, NS_AVATAR_DATA, NS_PUBSUB } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

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

interface LoadAvatarDataResponse {
  encoding: string;
  data: string;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const PHONE_URI_REGEX = /^tel:(.+)$/;

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
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { LoadVCardResponse, LoadAvatarDataResponse };
export default BrokerModuleProfile;
