/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum AudioFormat {
  // OGA format (here: Vorbis codec).
  OGA = "oga",
  // M4A format (here: AAC codec).
  M4A = "m4a"
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const AUDIO_TYPES_PIPELINE = [
  {
    format: AudioFormat.OGA,
    mime: 'audio/ogg; codecs="vorbis"'
  },

  {
    format: AudioFormat.M4A,
    mime: 'audio/mp4; codecs="mp4a.40.2"'
  }
];

/**************************************************************************
 * AUDIO
 * ************************************************************************* */

class UtilitiesAudio {
  private __format: AudioFormat | null;

  constructor() {
    // Initialize supported audio format
    this.__format = null;
  }

  detect(): void {
    if (this.__format === null) {
      // Create transient audio element
      const audioElement = document.createElement("audio");

      if (typeof audioElement.canPlayType === "function") {
        for (let i = 0; i < AUDIO_TYPES_PIPELINE.length; i++) {
          const audioType = AUDIO_TYPES_PIPELINE[i];

          if (audioElement.canPlayType(audioType.mime) === "probably") {
            this.__format = audioType.format;

            break;
          }
        }
      }

      if (this.__format === null) {
        logger.warn("No audio format supported, sounds will not play");
      } else {
        logger.info(`Detected supported audio format: ${this.__format}`);
      }
    } else {
      throw new Error("Audio format already detected");
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesAudio();
