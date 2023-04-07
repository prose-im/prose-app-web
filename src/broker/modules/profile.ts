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

export default BrokerModuleProfile;
