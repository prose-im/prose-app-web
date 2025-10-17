/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  AccountInfo,
  WorkspaceInfo,
  WorkspaceIcon
} from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleAccount extends BrokerModule {
  async loadAccountInfo(): Promise<AccountInfo | void> {
    logger.info("Will load account information (or reload)");

    return (await this._client.client?.loadAccountInfo()) || undefined;
  }

  async loadWorkspaceInfo(): Promise<WorkspaceInfo | void> {
    logger.info("Will load workspace information (or reload)");

    return (await this._client.client?.loadWorkspaceInfo()) || undefined;
  }

  async loadWorkspaceIcon(icon: WorkspaceIcon): Promise<Blob | void> {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html

    logger.info(`Will load workspace icon (ID ${icon.id})`);

    try {
      // Acquire icon as a Binary Large OBject
      return await this._client.client?.loadWorkspaceIconBlob(icon);
    } catch (error) {
      logger.warn(`Failed to load workspace icon (ID ${icon.id})`, error);
    }

    return undefined;
  }

  async changePassword(password: string): Promise<void> {
    // XEP-0077: In-Band Registration
    // https://xmpp.org/extensions/xep-0077.html#usecases-changepw

    logger.info("Will change account password");

    await this._client.client?.changePassword(password);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleAccount;
