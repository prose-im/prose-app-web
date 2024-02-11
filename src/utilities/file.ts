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

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type FileUploadHeaders = { [name: string]: string };

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface FileAttributes {
  url: string;
  name: string;
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
  "image/jpeg": FileShrinkTarget.Image,
  "image/png": FileShrinkTarget.Image,
  "image/webp": FileShrinkTarget.Image
};

const SHRINK_IMAGE_OPTIONS = {
  maxSize: 2400,
  quality: 0.85
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
    const shrinkTarget =
      SHRINK_MIME_TARGETS[file.type] || FileShrinkTarget.None;

    switch (shrinkTarget) {
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

    // Acquire file extension (if any)
    let fileExtension;

    const fileExtensionStartIndex = fileName.indexOf(".");

    if (fileExtensionStartIndex > -1) {
      fileExtension =
        fileName.substring(fileExtensionStartIndex + 1).toLowerCase() || null;
    } else {
      fileExtension = null;
    }

    // Guess MIME type from extension (in known MIME types)
    let mimeGuessOrNone;

    if (fileExtension !== null) {
      mimeGuessOrNone = KNOWN_MIMES[fileExtension] || null;
    } else {
      mimeGuessOrNone = null;
    }

    return {
      url: fileUrl,
      name: fileName,
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
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { FileUploadMethod };
export type { FileUploadHeaders };
export default new UtilitiesFile();
