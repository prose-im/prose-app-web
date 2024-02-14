<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-form-recorder(
  v-hotkey="hotkeys"
)
  base-icon(
    name="mic.fill"
    size="15px"
    :class=`[
      "c-inbox-form-recorder__icon",
      {
        "u-animate": isRecording,
        "u-animate--infinite": isRecording,
        "u-animate--superslow": isRecording,
        "u-animate--delayed": isRecording,
        "u-animate--blink": isRecording
      }
    ]`
  )

  span.c-inbox-form-recorder__timer.u-medium
    | {{ timerText }}

  .c-inbox-form-recorder__actions(
    v-if="actions.length > 0"
  )
    base-tooltip(
      v-for="action in actions"
      :key="action.id"
      :tooltip="action.tooltip"
    )
      base-button(
        @click="action.click"
        :disabled="emitAudioProcessing"
        :loading="emitAudioProcessing"
        :class=`[
          "c-inbox-form-recorder__action",
          "c-inbox-form-recorder__action--" + action.id
        ]`
        tint="light"
        size="custom"
        button-class="c-inbox-form-recorder__action-button"
        round
        borderless
      )
        template(
          v-slot:custom
        )
          base-icon(
            :name="action.icon.name"
            :size="action.icon.size"
            class="c-inbox-form-recorder__action-icon"
          )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import fixWebmDuration from "webm-duration-fix";

// ENUMERATIONS
enum TimerMode {
  // Register mode.
  Register = "register",
  // Unregister mode.
  Unregister = "unregister"
}

// INTERFACES
export interface Audio {
  file: File;
  duration: number;
}

// CONSTANTS
const MINUTE_TO_SECONDS = 60; // 1 minute

const TIMER_INTERVAL_TIME = 1000; // 1 second
const TIMER_SECONDS_MAXIMUM = 600; // 10 minutes

const RECORDER_AUDIO_BITRATE = 32000; // 32 Kbps
const RECORDER_AUDIO_EXTENSION = "weba";
const RECORDER_AUDIO_MIME = "audio/webm";
const RECORDER_AUDIO_CODEC = "opus";
const RECORDER_AUDIO_FILE_TITLE = "Audio Recording";

export default {
  name: "InboxFormRecorder",

  emits: ["audio", "cancel", "error"],

  data() {
    return {
      // --> DATA <--

      actions: [
        {
          id: "cancel",
          tooltip: "Cancel Recording",
          click: this.onCancelClick,

          icon: {
            name: "xmark",
            size: "8px"
          }
        },

        {
          id: "send",
          tooltip: "Send Audio",
          click: this.onSendClick,

          icon: {
            name: "arrow.right",
            size: "11px"
          }
        }
      ],

      // --> STATE <--

      stream: null as null | MediaStream,
      recorder: null as null | MediaRecorder,

      audioChunks: [] as Array<Blob>,

      emitAudioProcessing: false,
      emitAudioOnStop: false,

      timerSeconds: 0,
      timerInterval: null as null | ReturnType<typeof setInterval>
    };
  },

  computed: {
    timerText(): string {
      // Compute seconds and minutes
      const timerSeconds = this.timerSeconds % MINUTE_TO_SECONDS,
        timerMinutes = Math.floor(this.timerSeconds / MINUTE_TO_SECONDS);

      // Convert numbers to text
      let timerMinutesText = `${timerMinutes}`,
        timerSecondsText = `${timerSeconds}`;

      if (timerSecondsText.length === 1) {
        timerSecondsText = `0${timerSecondsText}`;
      }

      return [timerMinutesText, timerSecondsText].join(":");
    },

    isRecording(): boolean {
      return this.timerInterval !== null;
    },

    hotkeys(): { [name: string]: (event: Event) => void } {
      return {
        escape: this.onHotkeyEscape
      };
    }
  },

  async mounted() {
    // Start audio acquire
    await this.startAudioAcquire();
  },

  beforeUnmount() {
    // Stop recording (forced; if any)
    this.destroyMediaRecorder();

    // Unsetup timer (forced + reset)
    this.setupTimer(TimerMode.Unregister, true);
  },

  methods: {
    // --> HELPERS <--

    setupTimer(mode: TimerMode, reset = false): void {
      // Unsetup any previously-running timer (regardless of mode)
      if (this.timerInterval !== null) {
        clearInterval(this.timerInterval);

        this.timerInterval = null;
      }

      // Reset current timer seconds?
      if (reset === true) {
        this.timerSeconds = 0;
      }

      // Register new timer?
      if (mode === TimerMode.Register) {
        // Start timer
        this.timerInterval = setInterval(() => {
          this.timerSeconds += 1;

          // Request audio data to be drained
          this.recorder?.requestData();

          // Timer should be stopped? (maximum audio duration reached)
          if (this.timerSeconds >= TIMER_SECONDS_MAXIMUM) {
            // Stop recording (if any)
            this.recorder?.stop();

            // Stop timer (forced)
            this.setupTimer(TimerMode.Unregister);
          }
        }, TIMER_INTERVAL_TIME);
      }
    },

    async startAudioAcquire(): Promise<void> {
      try {
        // Another audio recorder already exists?
        if (this.recorder !== null) {
          throw new Error("Audio recorder instance already bound");
        }

        // Capture media stream
        this.stream = await this.captureMediaStream();

        // Create media recorder
        this.recorder = this.createMediaRecorder(this.stream);

        // Start recording
        this.recorder.start();
      } catch (error) {
        this.$log.error("Could not start audio acquire", error);

        // Raise an error
        this.$emit("error", error);
      }
    },

    async captureMediaStream(): Promise<MediaStream> {
      if (typeof navigator.mediaDevices?.getUserMedia === "function") {
        return await navigator.mediaDevices.getUserMedia({
          audio: true
        });
      }

      throw new Error("Audio recording unavailable");
    },

    createMediaRecorder(stream: MediaStream): MediaRecorder {
      const recorder = new MediaRecorder(stream, {
        mimeType: `${RECORDER_AUDIO_MIME}; codecs=${RECORDER_AUDIO_CODEC}`,
        audioBitsPerSecond: RECORDER_AUDIO_BITRATE
      });

      // Bind event listeners
      recorder.addEventListener("start", () => {
        this.$log.info("Audio recorder started");

        // Start timer (reset timer)
        this.setupTimer(TimerMode.Register, true);
      });

      recorder.addEventListener("stop", async () => {
        this.$log.info("Audio recorder stopped");

        // Stop timer
        this.setupTimer(TimerMode.Unregister);

        // Emit audio now?
        if (this.emitAudioOnStop === true) {
          await this.emitAudio();
        }
      });

      recorder.addEventListener("resume", () => {
        this.$log.info("Audio recorder resumed");

        // Resume timer
        this.setupTimer(TimerMode.Register);
      });

      recorder.addEventListener("pause", () => {
        this.$log.info("Audio recorder paused");

        // Pause timer
        this.setupTimer(TimerMode.Unregister);
      });

      recorder.addEventListener("error", () => {
        this.$log.error("Audio recorder error");

        // Raise a generic error
        this.$emit("error", new Error("Recorder error"));
      });

      recorder.addEventListener("dataavailable", (event: BlobEvent) => {
        this.$log.info(
          `Audio recorder data received (chunk #${this.audioChunks.length})`
        );

        // Assign audio data
        this.audioChunks.push(event.data);
      });

      return recorder;
    },

    destroyMediaRecorder() {
      // Stop recorder? (if any)
      if (this.recorder !== null) {
        try {
          // Stop recording (forced)
          this.recorder.stop();
        } catch (error) {
          this.$log.warn("Failed destroying existing media recorder", error);
        }
      }

      // Stop associated stream tracks? (if any)
      if (this.stream !== null) {
        try {
          this.stream.getTracks().forEach(track => {
            track.stop();
          });
        } catch (error) {
          this.$log.warn(
            "Failed stopping stream tracks associated to media recorder",
            error
          );
        }
      }

      // Forcibly unset recorder instances
      this.recorder = null;
      this.stream = null;
      this.audioChunks = [];
      this.emitAudioOnStop = false;
    },

    async emitAudio(): Promise<void> {
      try {
        // Mark as processing audio
        this.emitAudioProcessing = true;

        // Acquire audio duration
        const audioDuration = this.timerSeconds;

        if (audioDuration === 0) {
          throw new Error("Cannot emit audio with a duration of zero");
        }

        // Acquire audio chunks
        const audioChunks = this.audioChunks;

        if (audioChunks.length === 0) {
          throw new Error("Cannot emit audio with no audio chunks");
        }

        // Make audio blob
        const audioBlob = new Blob(audioChunks, { type: RECORDER_AUDIO_MIME });

        // Fix audio duration
        // Notice: this is due to an issue in most major Web browsers, where \
        //   WebM media files coming out of the MediaRecorder have their \
        //   duration set to 'Infinity'. We need the duration to be set to an \
        //   actual number, so that we can show the real duration in the UI.
        const audioBlobWithDuration = await fixWebmDuration(audioBlob);

        // Create audio file
        const nowTime = Date.now();

        let audioFile = new File(
          [audioBlobWithDuration],
          `${RECORDER_AUDIO_FILE_TITLE} ${nowTime}.${RECORDER_AUDIO_EXTENSION}`,

          {
            type: RECORDER_AUDIO_MIME,
            lastModified: nowTime
          }
        );

        // Emit final audio
        this.$emit("audio", {
          file: audioFile,
          duration: audioDuration
        });
      } catch (error) {
        // Emit error
        this.$emit("error", error);
      } finally {
        // Not processing audio anymore
        this.emitAudioProcessing = false;
      }
    },

    // --> EVENT LISTENERS <--

    onHotkeyEscape(): void {
      // Trigger cancel click event
      this.onCancelClick();
    },

    async onSendClick(): Promise<void> {
      // Any recorder? Send audio
      if (this.recorder !== null) {
        // Mark as eligible for sending (once stopped)
        this.emitAudioOnStop = true;

        // Finalize audio
        if (this.recorder.state === "recording") {
          // Stop recording (and wait for final audio chunk)
          this.recorder.stop();
        } else {
          // Emit audio in buffer straight away (already stopped)
          await this.emitAudio();
        }
      } else {
        // No recorder, equivalent to cancel
        this.$emit("cancel");
      }
    },

    onCancelClick(): void {
      // Stop recording
      this.recorder?.stop();

      this.$emit("cancel");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-recorder";

// VARIABLES
$recorder-cancel-button-size: 20px;
$recorder-send-button-size: 24px;

#{$c} {
  background-color: rgb(var(--color-base-green-normal));
  border: 1px solid rgba(var(--color-black), 0.09);
  color: rgb(var(--color-text-reverse));
  padding: 0 6px;
  display: flex;
  align-items: center;
  border-radius: 16px;

  #{$c}__icon {
    fill: rgb(var(--color-white));
    margin-inline-start: 3px;
    margin-inline-end: 5px;
  }

  #{$c}__timer {
    font-size: 12.5px;
    margin-block-start: -1px;

    /* This normalizes different glyphs/numbers horizontal widths */
    min-width: 30px;
  }

  #{$c}__actions {
    margin-inline-start: 4px;
    display: flex;
    align-items: center;

    > * {
      margin-inline-end: 3px;
      flex: 0 0 auto;

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }

  #{$c}__action {
    #{$c}__action-button {
      display: flex;
      align-content: center;
      justify-content: center;
    }

    &--cancel {
      #{$c}__action-button {
        width: $recorder-cancel-button-size;
        height: $recorder-cancel-button-size;
      }

      #{$c}__action-icon {
        fill: rgb(var(--color-base-red-normal));
      }
    }

    &--send {
      #{$c}__action-button {
        width: $recorder-send-button-size;
        height: $recorder-send-button-size;
      }

      #{$c}__action-icon {
        fill: rgb(var(--color-base-green-normal));
      }
    }
  }
}
</style>
