<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
form-settings-editor(
  :fieldsets="fieldsets"
  class="p-edit-profile-profile"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef, PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";
import { countries } from "crisp-countries-languages";

// PROJECT: COMPONENTS
import BaseFlag from "@/components/base/BaseFlag.vue";
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect,
  FieldsetFieldDataToggle as FormFieldsetFieldDataToggle,
  FieldsetControlActionType as FormFieldsetControlActionType,
  FieldsetControlActionDataButton as FormFieldsetControlActionDataButton,
  FieldsetControlIconType as FormFieldsetControlIconType,
  FieldsetOptionAside as FormFieldsetOptionAside
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: POPUPS
import { FormProfile as ProfileFormProfile } from "@/popups/sidebar/EditProfile.vue";

// ENUMERATIONS
enum GeolocationPermission {
  // Not yet allowed permission.
  NotYetAllowed = "not-yet-allowed",
  // Disallowed permission.
  Disallowed = "disallowed",
  // Allowed permission.
  Allowed = "allowed",
  // Unknown permission.
  Unknown = "unknown"
}

export default {
  name: "EditProfileProfile",

  components: { FormSettingsEditor },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    form: {
      type: Object as PropType<ProfileFormProfile>,
      required: true
    }
  },

  data() {
    return {
      // --> DATA <--

      locationCountryOptions: countries.map(country => {
        return {
          value: country.code,
          label: country.name
        };
      }),

      locationCountryIcon: {
        component: shallowRef(BaseFlag),

        properties: (value: string) => {
          return {
            code: value,
            width: "20px",
            height: "15px",
            shadow: "none"
          };
        }
      },

      // --> STATE <--

      geolocationPermission: GeolocationPermission.Unknown
    };
  },

  computed: {
    fieldsets(): Array<FormFieldset> {
      return [
        {
          id: "job",
          title: "Job information",

          fields: [
            {
              id: "organization",
              type: FormFieldsetFieldType.Input,
              label: "Organization:",

              data: {
                value: this.form.jobOrganization,
                placeholder: "Enter your company name…"
              } as FormFieldsetFieldDataInput
            },

            {
              id: "title",
              type: FormFieldsetFieldType.Input,
              label: "Title:",

              data: {
                value: this.form.jobTitle,
                placeholder: "Enter your job title…"
              } as FormFieldsetFieldDataInput
            }
          ],

          notes: [
            "Your current organization and job title are shared with your team members and contacts to identify your position within your company."
          ],

          options: {
            aside: FormFieldsetOptionAside.Fixed
          }
        },

        {
          id: "location",
          title: "Current location",

          fields: [
            {
              id: "automatic",
              type: FormFieldsetFieldType.Toggle,
              label: "Auto-detect:",

              data: {
                value: this.form.locationAutodetect
              } as FormFieldsetFieldDataToggle
            },

            {
              id: "city",
              type: FormFieldsetFieldType.Input,
              label: "City:",

              data: {
                value: this.form.locationCity,
                placeholder: "Enter your current city…",
                disabled: this.form.locationAutodetect.inner || false
              } as FormFieldsetFieldDataInput
            },

            {
              id: "country",
              type: FormFieldsetFieldType.Select,
              label: "Country:",

              data: {
                value: this.form.locationCountry,
                placeholder: "Pick a country…",

                options: this.locationCountryOptions,
                icon: this.locationCountryIcon,
                disabled: this.form.locationAutodetect.inner || false
              } as FormFieldsetFieldDataSelect
            }
          ],

          controls: [
            {
              id: "location-mode",
              label: "Location mode:",

              value: this.form.locationAutodetect.inner
                ? "Automatic"
                : "Manual",

              icon: this.form.locationAutodetect.inner
                ? FormFieldsetControlIconType.LocationActive
                : FormFieldsetControlIconType.LocationInactive
            },

            {
              id: "location-permission",
              label: "Geolocation permission:",
              value: this.locationPermissionDetails.label,
              color: this.locationPermissionDetails.color,
              emphasis: this.locationPermissionDetails.emphasis,

              actions: this.locationPermissionDetails.action
                ? [
                    {
                      type: FormFieldsetControlActionType.Button,

                      data: {
                        text: "Allow"
                      } as FormFieldsetControlActionDataButton
                    }
                  ]
                : undefined
            }
          ],

          notes: [
            "You can opt-in to automatic location updates based on your last used device location. It is handy if you travel a lot, and would like this to be auto-managed. Your current city and country will be shared, not your exact GPS location.",
            "Note that geolocation permissions are required for automatic mode."
          ],

          options: {
            aside: FormFieldsetOptionAside.Fixed
          }
        }
      ];
    },

    locationPermissionDetails(): {
      label: string;
      color: string;
      emphasis?: boolean;
      action?: boolean;
    } {
      switch (this.geolocationPermission) {
        case GeolocationPermission.NotYetAllowed: {
          return {
            label: "Not yet allowed",
            color: this.form.locationAutodetect.inner ? "orange" : "grey",
            emphasis: this.form.locationAutodetect.inner || false
            // action: true -- TODO: add action
          };
        }

        case GeolocationPermission.Disallowed: {
          return {
            label: "Disallowed",
            color: "red",
            emphasis: this.form.locationAutodetect.inner || false
          };
        }

        case GeolocationPermission.Allowed: {
          return {
            label: "Allowed",
            color: this.form.locationAutodetect.inner ? "green" : "grey"
          };
        }

        default: {
          return {
            label: "Unknown",
            color: "grey"
          };
        }
      }
    }
  },

  async mounted() {
    // Check for geolocation permission
    this.geolocationPermission = await this.acquireGeolocationPermission();
  },

  methods: {
    // --> HELPERS <--

    async acquireGeolocationPermission(): Promise<GeolocationPermission> {
      try {
        // Request geolocation permission
        const permission = await navigator.permissions.query({
          name: "geolocation"
        });

        // Handle acquired permission
        switch (permission.state) {
          case "granted": {
            return GeolocationPermission.Allowed;
          }

          case "denied": {
            return GeolocationPermission.Disallowed;
          }

          case "prompt": {
            return GeolocationPermission.NotYetAllowed;
          }
        }
      } catch (error) {
        this.$log.error("Failed acquiring geolocation permission", error);

        return GeolocationPermission.Unknown;
      }
    }
  }
};
</script>
