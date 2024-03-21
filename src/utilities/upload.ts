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
  RoomID,
  Attachment,
  AttachmentMetadata,
  Thumbnail,
  UploadSlot,
  UploadHeader
} from "@prose-im/prose-sdk-js";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import {
  default as UtilitiesFile,
  FileUploadMethod,
  FileUploadHeaders,
  FileThumbnailTarget
} from "@/utilities/file";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum UploadOptions {
  // Optimize And Shrink option.
  OptimizeAndShrink = "optimize-and-shrink",
  // None Specified option.
  NoneSpecified = "none-specified"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type UploadQueue = { [roomId: RoomID]: Array<UploadQueueFile> };
type UploadSlotGenerator = (file: File) => Promise<UploadSlot | void>;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface UploadQueueFile {
  file: File;
  slot: UploadSlotGenerator;
  options: UploadOptions;
}

interface UploadBatchResult {
  attachments: Array<Attachment>;
  failedFiles: Array<File>;
}

/**************************************************************************
 * MEDIA
 * ************************************************************************* */

class UtilitiesUpload {
  private __queue: UploadQueue;

  constructor() {
    // Initialize queue
    this.__queue = {};
  }

  hasQueue(roomId: RoomID): boolean {
    return roomId in this.__queue ? true : false;
  }

  addToQueue(
    roomId: RoomID,
    file: File,
    options: UploadOptions,
    slotGenerator: UploadSlotGenerator
  ): void {
    // Assign queue register for room?
    if (!(roomId in this.__queue)) {
      this.__queue[roomId] = [];
    }

    // Append file to upload queue for room
    this.__queue[roomId].push({
      file,
      options,
      slot: slotGenerator
    });
  }

  async processQueue(roomId: RoomID): Promise<UploadBatchResult> {
    const result: UploadBatchResult = {
      attachments: [],
      failedFiles: []
    };

    // Upload next queued file
    // Notice: this recurses until there are no files pending in the queue, \
    //   this also does not error out in any case, so that upload errors do \
    //   not block next upload.
    await this.__processNextQueuedFileUpload(roomId, result);

    return result;
  }

  private async __processNextQueuedFileUpload(
    roomId: RoomID,
    result: UploadBatchResult
  ): Promise<void> {
    const currentFile = (this.__queue[roomId] || []).shift() || null;

    // Current file found in queue?
    if (currentFile !== null) {
      logger.debug(
        `Uploading next file in queue: '${currentFile.file.name}'...`
      );

      try {
        // Upload current file
        const attachment = await this.__processQueuedFileUpload(currentFile);

        logger.info(`Uploaded next file in queue: '${currentFile.file.name}'`);

        // Append uploaded file to success stack
        result.attachments.push(attachment);
      } catch (error) {
        logger.error(
          `Could not upload next file in queue: '${currentFile.file.name}'`,
          error
        );

        // Append non-uploaded file to success stack
        result.failedFiles.push(currentFile.file);
      } finally {
        // Process next file in queue (if any)
        await this.__processNextQueuedFileUpload(roomId, result);
      }
    } else {
      logger.debug("Reached end of files queued for upload");

      // Unassign queue register for room
      delete this.__queue[roomId];
    }
  }

  private async __processQueuedFileUpload({
    file,
    options,
    slot
  }: UploadQueueFile): Promise<Attachment> {
    // Prepare file for upload? (eg. downsize if image)
    // Important: replace previous file, with either shrunk file, or itself.
    if (options === UploadOptions.OptimizeAndShrink) {
      file = await UtilitiesFile.attemptToShrinkSize(file);
    } else {
      logger.warn(
        "Skipping pre-upload file optimizations, " +
          "because provided options explicitly requested not to optimize"
      );
    }

    // Attempt to generate a thumbnail for file (if file is a media)
    // Notice: generate thumbnail after shrinking file, since working on a \
    //   smaller file will make the thumbnail generation process faster.
    const thumbnailResult = await UtilitiesFile.attemptToGenerateThumbnail(
      file
    );

    // Request file upload slot and upload file
    const fileSlot = await this.__uploadTargetFileToSlot(file, slot);

    if (!fileSlot) {
      throw new Error("Could not obtain an upload slot");
    }

    // Upload thumbnail file (as needed, if any)
    const thumbnailSlot =
      thumbnailResult.image !== undefined
        ? await this.__uploadTargetFileToSlot(thumbnailResult.image.file, slot)
        : undefined;

    // Generate attachment metadata (and optional thumbnail)
    // Notice: prefer using local file type instead of media type from file \
    //   upload slot, since upload slot media type might sometimes be invalid \
    //   since it is auto-detected from the download URL.
    const metadata = new AttachmentMetadata(
      fileSlot.downloadURL,
      file.type || fileSlot.mediaType,
      fileSlot.fileName,
      fileSlot.fileSize
    );

    const thumbnail =
      thumbnailSlot !== undefined && thumbnailResult.image !== undefined
        ? Thumbnail.fromSlot(
            thumbnailSlot,
            thumbnailResult.image.width,
            thumbnailResult.image.height
          )
        : undefined;

    // Acquire detected media duration from thumbnail (only applies to \
    //   audios and videos)
    const duration = BigInt(thumbnailResult.metas?.duration || 0);

    // Make actual attachment
    let attachment: Attachment;

    switch (thumbnailResult.target) {
      // Image attachment
      case FileThumbnailTarget.Image: {
        attachment =
          thumbnail !== undefined
            ? Attachment.imageAttachment(metadata, thumbnail)
            : Attachment.fileAttachment(metadata);

        break;
      }

      case FileThumbnailTarget.Video: {
        // Video attachment
        attachment =
          thumbnail !== undefined
            ? Attachment.videoAttachment(metadata, duration, thumbnail)
            : Attachment.fileAttachment(metadata);

        break;
      }

      case FileThumbnailTarget.Audio: {
        // Audio attachment
        attachment = Attachment.audioAttachment(metadata, duration);

        break;
      }

      default: {
        // Other attachments
        attachment = Attachment.fileAttachment(metadata);
      }
    }

    return attachment;
  }

  private async __uploadTargetFileToSlot(
    file: File,
    slotGenerator: UploadSlotGenerator
  ): Promise<UploadSlot | void> {
    // Request file upload slot
    const slot = await slotGenerator(file);

    if (slot !== undefined) {
      // Extract headers from slot headers
      const slotHeaders: FileUploadHeaders = {};

      slot.uploadHeaders.forEach((header: UploadHeader) => {
        slotHeaders[header.name] = header.value;
      });

      // Upload file
      await UtilitiesFile.upload(
        FileUploadMethod.PUT,
        slot.uploadURL,
        file,
        slotHeaders
      );

      // Return slot (containing the download URL)
      return slot;
    }

    return undefined;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { UploadOptions };
export default new UtilitiesUpload();
