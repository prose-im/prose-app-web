/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum FileUploadMethod {
  // POST method
  POST = "post",
  // PUT method
  PUT = "put"
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
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { FileUploadMethod };
export type { FileUploadHeaders };
export default new UtilitiesFile();
