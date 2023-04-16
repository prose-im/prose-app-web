/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { default as $, Cash } from "cash-dom";
import { $iq } from "strophe.js";
import xmppID from "@xmpp/id";
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { NS_VCARD4 } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface LoadVCardResponse {
  fullName?: string;
  url?: string;
  email?: string;
  address: LoadVCardResponseAddress;
}

interface LoadVCardResponseAddress {
  city?: string;
  country?: string;
}

interface LoadAvatarResponse {
  meta: LoadAvatarResponseMeta;
  data: LoadAvatarResponseData;
}

interface LoadAvatarResponseMeta {
  id: string;
  type: string;
  bytes: number;
  height: number;
  width: number;
}

interface LoadAvatarResponseData {
  encoding: string;
  data: string;
}

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

  async loadAvatar(jid: JID): Promise<LoadAvatarResponse> {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html
    logger.info(`Will load avatar for: '${jid}'`);

    // const response = await this._client.request;
    // $iq({ to: jid, type: IQType.Get, id: xmppID() })();

    // TODO
    return this.__respondLoadAvatar($());
  }

  private __respondLoadAvatar(response: Cash): LoadAvatarResponse {
    const responseData: LoadAvatarResponse = {
      meta: {
        id: "",
        type: "",
        bytes: 0,
        height: 0,
        width: 0
      },

      data: {
        encoding: "",
        data: ""
      }
    };

    // TODO: implement PEP avatars hybrid aside vcard

    return responseData;
  }

  private __respondLoadVCard(response: Cash): LoadVCardResponse {
    const responseData: LoadVCardResponse = {
      address: {}
    };

    const vCardElement = response.find("vcard").first();

    // Append base data
    const fullName = vCardElement.find("fn text").text(),
      url = vCardElement.find("url uri").text(),
      email = vCardElement.find("email text").text();

    if (fullName) {
      responseData.fullName = fullName;
    }
    if (url) {
      responseData.url = url;
    }
    if (email) {
      responseData.email = email;
    }

    // Append address data
    const vCardAddressElement = vCardElement.find("adr").first();

    const addressLocality = vCardAddressElement.find("locality").text(),
      addressCountry = vCardAddressElement.find("country").text();

    if (addressLocality) {
      responseData.address.city = addressLocality;
    }
    if (addressCountry) {
      responseData.address.country = addressCountry;
    }

    return responseData;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { LoadAvatarResponse };
export default BrokerModuleProfile;
