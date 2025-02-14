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

export enum AudioSound {
  // Alert action success.
  AlertActionSuccess = "alerts/action-success",
  // Alert message receive.
  AlertMessageReceive = "alerts/message-receive"
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const AUDIO_MASTER_VOLUME = 30;

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
  private __player: AudioContext | null = null;
  private __cache: { [path: string]: AudioBuffer };

  constructor() {
    // Initialize supported audio format
    this.__format = null;

    // Initialize cache
    this.__cache = {};
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

  async play(
    sound: AudioSound,
    loop = false,
    volume = AUDIO_MASTER_VOLUME
  ): Promise<void> {
    // Can play sound? (otherwise ignore)
    if (this.__format !== null) {
      try {
        // Assert audio cache
        // Notice: if audio file is not in cache, then this will download the \
        //   target audio file.
        const [audioPlayer, audioBuffer] = await this.__assertAudio(
          `${sound}.${this.__format}`
        );

        // Resume audio context? (if suspended)
        if (audioPlayer.state === "suspended") {
          audioPlayer.resume();
        }

        // Create gain
        const audioGain = audioPlayer.createGain();

        audioGain.gain.setValueAtTime(volume / 100, 0);
        audioGain.connect(audioPlayer.destination);

        // Play audio source
        const audioSource = audioPlayer.createBufferSource();

        audioSource.buffer = audioBuffer;
        audioSource.loop = loop;

        audioSource.connect(audioGain);
        audioSource.start();
      } catch (error) {
        logger.error(`Could not play audio: ${sound}`, error);
      }
    }
  }

  private __assertPlayer(): AudioContext {
    // Initialize audio player? (required to decode audio file)
    if (this.__player === null) {
      // Cannot initialize?
      if (typeof AudioContext !== "function") {
        throw new Error("Cannot initialize audio context");
      }

      this.__player = new AudioContext();
    }

    return this.__player;
  }

  private async __assertAudio(
    path: string
  ): Promise<[AudioContext, AudioBuffer]> {
    try {
      return await this.__tryLoadCache(path);
    } catch (error) {
      logger.info(
        `Could not load audio from cache: ${path}, will fetch instead`,
        error
      );

      return await this.__tryLoadFetch(path);
    }
  }

  private async __tryLoadCache(
    path: string
  ): Promise<[AudioContext, AudioBuffer]> {
    if (path in this.__cache) {
      return [this.__assertPlayer(), this.__cache[path]];
    }

    return Promise.reject("Not found in cache (yet)");
  }

  private async __tryLoadFetch(
    path: string
  ): Promise<[AudioContext, AudioBuffer]> {
    // Assert audio player
    const player = this.__assertPlayer();

    // Fetch target audio file
    const response = await fetch(`/sounds/${path}`);

    if (response.ok === false) {
      throw new Error(`Failed loading audio file: HTTP ${response.status}`);
    }

    // Acquire audio buffer from response array buffer
    const audioBuffer = await player.decodeAudioData(
      await response.arrayBuffer()
    );

    // Write decoded buffer to cache
    this.__cache[path] = audioBuffer;

    return [player, audioBuffer];
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesAudio();
