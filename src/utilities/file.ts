/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { readAndCompressImage } from "browser-image-resizer";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import {
  default as UtilitiesVideo,
  VideoThumbnailPosition
} from "@/utilities/video";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum FileUploadMethod {
  // POST method
  POST = "post",
  // PUT method
  PUT = "put"
}

enum FileShrinkTarget {
  // Image target
  Image = "image",
  // None target
  None = "none"
}

enum FileThumbnailTarget {
  // Image target
  Image = "image",
  // Video target
  Video = "video",
  // None target
  None = "none"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type FileUploadHeaders = { [name: string]: string };

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface FileAttributes {
  name: string;
  bareName: string | null;
  extension: string | null;
  mimeGuess: string;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const PERCENT_BASE = 100;

const MIME_DEFAULT = "application/octet-stream";

const KNOWN_MIMES: { [extension: string]: string } = {
  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  png: "image/png",
  tiff: "image/tiff",
  webp: "image/webp",

  // Audios
  weba: "audio/webm",
  oga: "audio/ogg",
  mp3: "audio/mp3",
  m4a: "audio/mp4",
  aac: "audio/aac",

  // Videos
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogg",
  m4v: "video/mp4",
  mp4: "video/mp4"
};

const SHRINK_MIME_TARGETS: { [mime: string]: FileShrinkTarget } = {
  // Images
  "image/jpeg": FileShrinkTarget.Image,
  "image/png": FileShrinkTarget.Image,
  "image/webp": FileShrinkTarget.Image
};

const SHRINK_IMAGE_OPTIONS = {
  maxSize: 2400,
  quality: 0.85
};

const THUMBNAIL_MIME_TARGETS: { [mime: string]: FileThumbnailTarget } = {
  // Images
  "image/jpeg": FileThumbnailTarget.Image,
  "image/png": FileThumbnailTarget.Image,
  "image/webp": FileThumbnailTarget.Image,

  // Videos
  "video/webm": FileThumbnailTarget.Video,
  "video/ogg": FileThumbnailTarget.Video,
  "video/mp4": FileThumbnailTarget.Video
};

const THUMBNAIL_IMAGE_OPTIONS = {
  maxSize: 640,
  quality: 0.8,
  mimeType: "image/webp",
  nameSuffix: "thumbnail",
  extension: "webp"
};

/**************************************************************************
 * FILE
 * ************************************************************************* */

class UtilitiesFile {
  async upload(
    method: FileUploadMethod,
    url: string,
    file: File,
    headers?: FileUploadHeaders
  ): Promise<void> {
    // Generate file upload request headers
    const requestHeaders: FileUploadHeaders = {
      "Content-Length": `${file.size}`,
      "Content-Type": file.type
    };

    // Merge additional headers? (if any)
    if (headers) {
      Object.assign(requestHeaders, headers);
    }

    // Upload file
    await fetch(url, {
      body: file,
      mode: "cors",
      method: method.toString().toUpperCase(),
      headers: requestHeaders
    });
  }

  async attemptToShrinkSize(file: File): Promise<File> {
    const target = SHRINK_MIME_TARGETS[file.type] || FileShrinkTarget.None;

    switch (target) {
      case FileShrinkTarget.Image: {
        return await this.__shrinkImageSize(file);
      }

      default: {
        logger.info(
          `Not shrinking file: ${file.name} (no target for MIME: ${file.type})`
        );

        // Return file as-is (identity function)
        return file;
      }
    }
  }

  async attemptToGenerateThumbnail(file: File): Promise<File | void> {
    const target =
      THUMBNAIL_MIME_TARGETS[file.type] || FileThumbnailTarget.None;

    switch (target) {
      case FileThumbnailTarget.Image: {
        return this.__makeThumbnailFromImage(file);
      }

      case FileThumbnailTarget.Video: {
        return this.__makeThumbnailFromVideo(file);
      }

      default: {
        logger.info(
          `Not generating thumbnail for file: ${file.name} ` +
            `(no target for MIME: ${file.type})`
        );

        // Return no thumbnail file
        return undefined;
      }
    }
  }

  detectAttributesFromUrl(fileUrl: string): FileAttributes {
    // Parse URL
    const url = new URL(fileUrl);

    if (!url.pathname) {
      throw new Error("URL has no path name");
    }

    // Split URL path name into segments
    const pathSegments = url.pathname.split("/");

    // Acquire file name
    const fileName = pathSegments[pathSegments.length - 1];

    if (!fileName) {
      throw new Error("URL path has no file name");
    }

    return this.detectAttributesFromFileName(fileName);
  }

  detectAttributesFromFileName(fileName: string): FileAttributes {
    // Acquire file extension (if any)
    let fileExtension;

    const fileExtensionStartIndex = fileName.indexOf(".");

    if (fileExtensionStartIndex > -1) {
      fileExtension =
        fileName.substring(fileExtensionStartIndex + 1).toLowerCase() || null;
    } else {
      fileExtension = null;
    }

    // Acquire bare file name (name w/o extension)
    let fileBareName;

    if (fileExtensionStartIndex > -1) {
      fileBareName = fileName.substring(0, fileExtensionStartIndex);
    } else {
      fileBareName = fileName;
    }

    // Guess MIME type from extension (in known MIME types)
    let mimeGuessOrNone;

    if (fileExtension !== null) {
      mimeGuessOrNone = KNOWN_MIMES[fileExtension] || null;
    } else {
      mimeGuessOrNone = null;
    }

    return {
      name: fileName,
      bareName: fileBareName || null,
      extension: fileExtension,
      mimeGuess: mimeGuessOrNone || MIME_DEFAULT
    };
  }

  private async __shrinkImageSize(file: File): Promise<File> {
    logger.debug(`Shrinking image file: ${file.name}...`);

    try {
      // Shrink image file
      const imageBlob = await readAndCompressImage(file, {
        quality: SHRINK_IMAGE_OPTIONS.quality,
        maxWidth: SHRINK_IMAGE_OPTIONS.maxSize,
        maxHeight: SHRINK_IMAGE_OPTIONS.maxSize,
        mimeType: file.type
      });

      const imageFile = new File([imageBlob], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });

      // Shrinking resulted in a smaller file, return shrunk image file
      if (imageFile.size < file.size) {
        logger.info(
          `Shrunk image file: ${file.name} by ${Math.floor(
            (1.0 - imageFile.size / file.size) * PERCENT_BASE
          )}% (${file.size} bytes before, now ${imageFile.size} bytes)`
        );

        return imageFile;
      }

      // Shrinking resulted in a larger file, return original image file
      logger.warn(
        `Did not shrink image file: ${file.name} (it got larger than before)`
      );

      return file;
    } catch (error) {
      logger.error(
        `Error attempting shrinking image file: ${file.name}`,
        error
      );

      // Ignore error, return original file
      return file;
    }
  }

  private async __makeThumbnailFromImage(
    file: File,
    customName?: string
  ): Promise<File | void> {
    logger.debug(`Making thumbnail from image file: ${file.name}...`);

    try {
      // Generate thumbnail from image file
      const thumbnailBlob = await readAndCompressImage(file, {
        quality: THUMBNAIL_IMAGE_OPTIONS.quality,
        maxWidth: THUMBNAIL_IMAGE_OPTIONS.maxSize,
        maxHeight: THUMBNAIL_IMAGE_OPTIONS.maxSize,
        mimeType: THUMBNAIL_IMAGE_OPTIONS.mimeType
      });

      // Acquire thumbnail file name (from detected source file attributes)
      const fileName = customName || file.name,
        fileAttributes = this.detectAttributesFromFileName(fileName);

      const thumbnailFileName = `${fileAttributes.bareName || fileName}-${
        THUMBNAIL_IMAGE_OPTIONS.nameSuffix
      }.${THUMBNAIL_IMAGE_OPTIONS.extension}`;

      // Generate thumnnail file
      const thumbnailFile = new File([thumbnailBlob], thumbnailFileName, {
        type: THUMBNAIL_IMAGE_OPTIONS.mimeType
      });

      logger.info(
        `Made thumbnail from image file: ${file.name} with ` +
          `file name: ${thumbnailFile.name} (${thumbnailFile.size} bytes)`
      );

      return thumbnailFile;
    } catch (error) {
      logger.error(
        `Error attempting to make thumbnail from image file: ${file.name}`,
        error
      );

      // Could not make any thumbnail
      return undefined;
    }
  }

  private async __makeThumbnailFromVideo(file: File): Promise<File | void> {
    let thumbnailFile: File | void;

    logger.debug(`Making thumbnail from video file: ${file.name}...`);

    // Obtain URL object from file
    // Important: this has to be revoked at a later point, otherwise this will \
    //   stay in browser memory!
    const fileUrl = URL.createObjectURL(file);

    try {
      // Attempt to extract a cover image from video
      const { thumbnailBlob } = await UtilitiesVideo.thumbnail(
        fileUrl,
        VideoThumbnailPosition.Middle
      );

      // Acquire cover file from thumbnail
      const coverFile = new File([thumbnailBlob], "cover", {
        type: thumbnailBlob.type
      });

      // Make final thumbnail image from extracted cover image (if any)
      // Notice: specify original video file name, so that the thumbnail image \
      //   file name gets derived from this original file name, and not the \
      //   cover file name.
      if (coverFile !== undefined) {
        logger.info(
          `Acquired cover image from video file: ${file.name}, ` +
            `will now make final thumbnail from cover image file`
        );

        thumbnailFile = await this.__makeThumbnailFromImage(
          coverFile,
          file.name
        );
      }
    } catch (error) {
      logger.error(
        `Error attempting to make thumbnail from video file: ${file.name}`,
        error
      );
    } finally {
      // Revoke created URL object (free up memory)
      URL.revokeObjectURL(fileUrl);
    }

    return thumbnailFile;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { FileUploadMethod };
export type { FileUploadHeaders };
export default new UtilitiesFile();
