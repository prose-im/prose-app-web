/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum MediaVideoThumbnailPosition {
  // Middle position
  Middle = "middle"
}

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface MediaImageSize {
  width: number;
  height: number;
}

interface MediaAudioThumbnail {
  duration: number;
}

interface MediaVideoThumbnail {
  thumbnailBlob: Blob;
  duration: number;
  width: number;
  height: number;
}

/**************************************************************************
 * MEDIA
 * ************************************************************************* */

class UtilitiesMedia {
  async imageSize(imageUrl: string): Promise<MediaImageSize> {
    // Create local image element
    const imageElement: HTMLImageElement = new Image();

    imageElement.src = imageUrl;

    // Load image?
    if (!imageElement.complete) {
      await new Promise((resolve, reject) => {
        imageElement.addEventListener(
          "load",

          () => {
            resolve(null);
          },

          { once: true }
        );

        imageElement.addEventListener(
          "error",

          () => {
            reject(new Error("Error loading image"));
          },

          { once: true }
        );
      });
    }

    return {
      width: imageElement.width,
      height: imageElement.height
    };
  }

  async imageSizeFromFile(imageFile: File): Promise<MediaImageSize> {
    let imageSize: MediaImageSize | void, sizeError: Error | void;

    // Obtain URL object from file
    // Important: this has to be revoked at a later point, otherwise this will \
    //   stay in browser memory!
    const imageFileUrl = URL.createObjectURL(imageFile);

    try {
      // Acquire image size
      imageSize = await this.imageSize(imageFileUrl);
    } catch (error) {
      sizeError = error as Error;
    } finally {
      // Revoke created URL object (free up memory)
      URL.revokeObjectURL(imageFileUrl);
    }

    // Throw error?
    if (imageSize === undefined || sizeError !== undefined) {
      throw sizeError || new Error("No image size acquired");
    }

    // Return image size
    return imageSize;
  }

  async audioThumbnail(audioUrl: string): Promise<MediaAudioThumbnail> {
    // Create local audio element
    const audioElement: HTMLAudioElement = new Audio();

    // Setup audio element
    this.__setupMediaElement(audioElement, audioUrl);

    // Load audio meta-data
    await this.__loadMediaMetadata(audioElement);

    // Return audio thumbnail
    return {
      duration: this.__extractMediaDuration(audioElement)
    };
  }

  async videoThumbnail(
    videoUrl: string,
    position: MediaVideoThumbnailPosition
  ): Promise<MediaVideoThumbnail> {
    // Create local DOM elements
    const videoElement: HTMLVideoElement = document.createElement("video"),
      canvasElement: HTMLCanvasElement = document.createElement("canvas");

    // Setup video element
    this.__setupMediaElement(videoElement, videoUrl);

    videoElement.playsInline = true;

    // Load video meta-data
    await this.__loadMediaMetadata(videoElement);

    // Setup canvas (from video)
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Acquire time at which frame should be drawn
    let frameTime = 0;

    switch (position) {
      case MediaVideoThumbnailPosition.Middle: {
        frameTime = Math.floor(this.__extractMediaDuration(videoElement) / 2);

        break;
      }
    }

    // Draw thumbnail at time
    return await this.__drawVideoThumbnailAtTime(
      canvasElement,
      videoElement,
      frameTime
    );
  }

  private __setupMediaElement(
    mediaElement: HTMLMediaElement,
    mediaUrl: string
  ): void {
    mediaElement.crossOrigin = "anonymous";
    mediaElement.muted = true;
    mediaElement.preload = "metadata";
    mediaElement.src = mediaUrl;
  }

  private async __loadMediaMetadata(
    mediaElement: HTMLMediaElement
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Bind media loaded event listeners (or error)
      mediaElement.addEventListener(
        "loadedmetadata",

        () => {
          resolve();
        },

        { once: true }
      );

      mediaElement.addEventListener(
        "error",

        () => {
          reject(
            new Error(
              "Error loading media (codec might not be supported by this browser)"
            )
          );
        },

        { once: true }
      );

      // Load media
      mediaElement.load();
    });
  }

  private __extractMediaDuration(mediaElement: HTMLMediaElement): number {
    if (mediaElement.duration < Infinity) {
      return Math.round(mediaElement.duration);
    }

    return 0;
  }

  private async __drawVideoThumbnailAtTime(
    canvasElement: HTMLCanvasElement,
    videoElement: HTMLVideoElement,
    time: number
  ): Promise<MediaVideoThumbnail> {
    return new Promise((resolve, reject) => {
      // Set player to time
      videoElement.currentTime = time;

      // Define 'seeked' event listener
      const onSeeked = () => {
        // Draw video element to canvas
        canvasElement
          .getContext("2d")
          ?.drawImage(
            videoElement,
            0,
            0,
            videoElement.videoWidth,
            videoElement.videoHeight
          );

        // Convert canvas to image blob (resulting in a video thumbnail file)
        canvasElement.toBlob(blob => {
          if (blob) {
            resolve({
              thumbnailBlob: blob,
              duration: this.__extractMediaDuration(videoElement),
              width: videoElement.videoWidth,
              height: videoElement.videoHeight
            });
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        });

        // Clear 'seeked' event handler
        videoElement.removeEventListener("seeked", onSeeked);
      };

      // Wait until video frame has been seeked
      videoElement.addEventListener("seeked", onSeeked);
    });
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { MediaVideoThumbnailPosition };
export default new UtilitiesMedia();
