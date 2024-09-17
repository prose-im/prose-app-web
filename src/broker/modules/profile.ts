/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  JID,
  UserMetadata,
  UserProfile,
  Avatar as CoreAvatar
} from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

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
  async loadUserProfile(jid: JID): Promise<UserProfile | void> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html

    logger.info(`Will load vCard profile for: '${jid}'`);

    return await this._client.client?.loadUserProfile(jid);
  }

  async loadUserMetadata(jid: JID): Promise<UserMetadata | void> {
    // XEP-0012: Last Activity + XEP-0202: Entity Time
    // https://xmpp.org/extensions/xep-0012.html + \
    //   https://xmpp.org/extensions/xep-0202.html

    return await this._client.client?.loadUserMetadata(jid);
  }

  async loadAvatarData(
    userId: string,
    avatar: CoreAvatar
  ): Promise<LoadAvatarDataResponse | void> {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html

    logger.info(`Will load avatar for: '${userId}' (ID ${avatar.id})`);

    try {
      const dataURL = await this._client.client?.loadAvatarDataURL(avatar);

      if (dataURL) {
        return { dataURL };
      }
    } catch (error) {
      logger.warn(
        `Failed to load avatar for: '${userId}' (ID ${avatar.id})`,
        error
      );
    }

    return undefined;
  }

  async saveUserProfile(jid: JID, profile: UserProfile): Promise<void> {
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
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { LoadAvatarDataResponse, SaveAvatarRequest };
export default BrokerModuleProfile;
