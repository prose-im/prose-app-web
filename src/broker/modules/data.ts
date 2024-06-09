/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { UploadSlot } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import { MIME_DEFAULT as FILE_MIME_DEFAULT } from "@/utilities/file";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleData extends BrokerModule {
  async requestUploadSlot(
    fileName: string,
    fileSize: number,
    fileType?: string
  ): Promise<UploadSlot | void> {
    logger.info(
      `Will request upload slot for file name: '${fileName}' ` +
        `(size: ${fileSize} bytes, type: ${fileType || "?"})`
    );

    return await this._client.client?.requestUploadSlot(
      fileName,
      BigInt(fileSize),
      fileType || FILE_MIME_DEFAULT
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleData;
