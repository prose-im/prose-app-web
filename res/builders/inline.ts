/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type InlineDataItems = {
  [name: string]: InlineData;
};

type InlineData = string;

/**************************************************************************
 * INLINE
 * ************************************************************************* */

class BuilderInline {
  scripts(isApplication = false): InlineDataItems {
    // Notice: enable loader video only if not a Tauri application build, \
    //   meaning only for Web browser targets where resources are being pulled \
    //   from a remote server and therefore some wait is induced.
    return {
      loader: this.__scriptLoader(!isApplication)
    };
  }

  styles(): InlineDataItems {
    return {
      loader: this.__styleLoader()
    };
  }

  private __scriptLoader(withVideo = true): InlineData {
    return this.__wrapScriptClosure(`
      let theme;

      try {
        let themePreference = "system";

        // Acquire theme from user preference?
        if (window.localStorage !== undefined) {
          themePreference =
            window.localStorage.getItem("prose:boot:theme") || themePreference;
        }

        // Acquire final theme value
        if (themePreference === "system") {
          theme =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches === true
              ? "dark"
              : "light";
        } else if (themePreference === "dark") {
          theme = "dark";
        } else {
          theme = "light";
        }
      } catch (_) {
        // Fallback to light if error
        theme = "light";
      }

      // Loaded handler
      const loadedHandler = loaderElement => {
        // Apply detected theme to loader
        loaderElement.classList.add(\`loader--\${theme}\`);

        // Create loader video?
        if (${withVideo}) {
          const videoElement = document.createElement("video");

          videoElement.height = 80;
          videoElement.width = 200;
          videoElement.autoplay = true;
          videoElement.loop = true;
          videoElement.muted = true;

          // Append video sources (in priority order, most efficient first)
          const videoSources = [
            ["av1", "webm"],
            ["vp9", "webm"],
            ["hvc1", "mp4"]
          ];

          videoSources.forEach(videoSource => {
            const sourceElement = document.createElement("source");

            sourceElement.src = [
              \`/videos/loader/\${theme}\`,
              \`logo-\${videoSource[0]}.\${videoSource[1]}\`
            ].join("/");

            sourceElement.type = [
              \`video/\${videoSource[1]}\`,
              \`codecs=\${videoSource[0]}\`
            ].join("; ");

            videoElement.appendChild(sourceElement);
          });

          // Append loader video
          loaderElement.appendChild(videoElement);
        }
      };

      // Polls for loader readiness (every 10ms)
      // Notice: DOMContentLoaded comes way too late, therefore we need to \
      //   poll so that the loader animation and theme get applied ASAP.
      let pollerInterval = setInterval(() => {
        const loaderElement = document.getElementById("loader") || null;

        if (loaderElement !== null) {
          // Clear interval
          clearInterval(pollerInterval);

          pollerInterval = null;

          // Fire loaded handler
          loadedHandler(loaderElement);
        }
      }, 10);

      // Bind safety kill switch whenever DOM is loaded
      document.addEventListener("DOMContentLoaded", () => {
        // Fire loaded handler, in case DOM content loaded came before? (this \
        //   may happen sometimes)
        if (pollerInterval !== null) {
          // Clear interval
          clearInterval(pollerInterval);

          pollerInterval = null;

          const loaderElement = document.getElementById("loader") || null;

          // Fire loaded handler?
          if (loaderElement !== null) {
            loadedHandler(loaderElement);
          }
        }
      });
    `);
  }

  private __styleLoader(): InlineData {
    return `
      #loader {
        position: fixed;
        inset: 0;
      }

      #loader.loader--light {
        background-color: #fff;
      }

      #loader.loader--dark {
        background-color: #000;
      }

      #loader video {
        position: absolute;
        inset: 50%;
        transform: translate(-50%, -50%);
      }
    `;
  }

  private __wrapScriptClosure(script: InlineData): InlineData {
    // Convert script to closure to avoid context leakages
    return `(function() {\n${script}\n})();`;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BuilderInline();
