/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum VideoThumbnailPosition {
  // Middle position
  Middle = "middle"
}

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface VideoThumbnail {
  thumbnailBlob: Blob;
  width: number;
  height: number;
}

/**************************************************************************
 * VIDEO
 * ************************************************************************* */

class UtilitiesVideo {
  async thumbnail(
    videoUrl: string,
    position: VideoThumbnailPosition
  ): Promise<VideoThumbnail> {
    // Create local DOM elements
    const videoElement: HTMLVideoElement = document.createElement("video"),
      canvasElement: HTMLCanvasElement = document.createElement("canvas");

    // Setup video element
    videoElement.crossOrigin = "anonymous";
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.preload = "metadata";
    videoElement.src = videoUrl;

    // Load video meta-data
    videoElement.load();

    // Setup canvas (from video)
    await this.__setupThumbnailCanvas(canvasElement, videoElement);

    // Acquire time at which frame should be drawn
    let frameTime = 0;

    switch (position) {
      case VideoThumbnailPosition.Middle: {
        frameTime = Math.floor(videoElement.duration / 2);

        break;
      }
    }

    // Draw thumbnail at time
    return await this.__drawThumbnailAtTime(
      canvasElement,
      videoElement,
      frameTime
    );
  }

  private async __setupThumbnailCanvas(
    canvasElement: HTMLCanvasElement,
    videoElement: HTMLVideoElement
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      videoElement.addEventListener("loadedmetadata", () => {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        resolve();
      });

      videoElement.addEventListener("error", () => {
        reject(
          new Error(
            "Error loading video (codec might not be supported by this browser)"
          )
        );
      });
    });
  }

  private async __drawThumbnailAtTime(
    canvasElement: HTMLCanvasElement,
    videoElement: HTMLVideoElement,
    time: number
  ): Promise<VideoThumbnail> {
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

export { VideoThumbnailPosition };
export default new UtilitiesVideo();
