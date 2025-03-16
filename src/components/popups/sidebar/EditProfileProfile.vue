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
import BaseAlert from "@/components/base/BaseAlert.vue";
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

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// ENUMERATIONS
enum GeolocationPermission {
  // Not yet allowed permission.
  NotYetAllowed = "not-yet-allowed",
  // Disallowed permission.
  Disallowed = "disallowed",
  // Allowed permission.
  Allowed = "allowed",
  // FailedToObtain permission.
  FailedToObtain = "failed-to-obtain",
  // Unknown permission.
  Unknown = "unknown"
}

enum GeolocationAction {
  // Allow action.
  Allow = "allow",
  // Refresh action.
  Refresh = "refresh"
}

// INTERFACES
interface GeolocationPositionCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationPositionAddress {
  cityName: string;
  countryCode: string;
}

// CONSTANTS
const GEOLOCATION_ACQUIRE_STALE_AGE = 3600000; // 1 hour
const GEOLOCATION_ACQUIRE_TIMEOUT = 10000; // 10 seconds

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

      geolocationPermission: GeolocationPermission.Unknown,

      isRefreshingGeolocationPosition: false
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

                      data: (this.locationPermissionDetails.action ===
                      GeolocationAction.Refresh
                        ? {
                            text: this.isRefreshingGeolocationPosition
                              ? "Refreshing"
                              : "Refresh location",

                            disabled: this.isRefreshingGeolocationPosition,
                            click: this.onFieldsetLocationPermissionRefreshClick
                          }
                        : {
                            text: "Allow",
                            click: this.onFieldsetLocationPermissionAllowClick
                          }) as FormFieldsetControlActionDataButton
                    }
                  ]
                : undefined
            }
          ],

          notes: [
            "You can opt-in to automatic location detection. It is handy if you travel a lot, and would like to easily update your location in a single click. Your current city and country will be shared, not your exact GPS location.",
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
      action?: GeolocationAction;
    } {
      switch (this.geolocationPermission) {
        case GeolocationPermission.NotYetAllowed: {
          return {
            label: "Not yet allowed",
            color: this.form.locationAutodetect.inner ? "orange" : "grey",
            emphasis: this.form.locationAutodetect.inner || false,
            action: GeolocationAction.Allow
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
            color: this.form.locationAutodetect.inner ? "green" : "grey",

            action: this.form.locationAutodetect.inner
              ? GeolocationAction.Refresh
              : undefined
          };
        }

        case GeolocationPermission.FailedToObtain: {
          return {
            label: "Failed to obtain!",
            color: "red",
            emphasis: true
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
    },

    async obtainGeolocationPositionCoordinates(): Promise<GeolocationPositionCoordinates | null> {
      return new Promise((resolve, reject) => {
        try {
          navigator.geolocation.getCurrentPosition(
            position => {
              // Resolve with success
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },

            () => {
              // Reject with error
              resolve(null);
            },

            {
              timeout: GEOLOCATION_ACQUIRE_TIMEOUT,
              maximumAge: GEOLOCATION_ACQUIRE_STALE_AGE
            }
          );
        } catch (error) {
          // Reject with error
          reject(error);
        }
      });
    },

    async obtainGeolocationPositionAddress(
      coordinates: GeolocationPositionCoordinates
    ): Promise<GeolocationPositionAddress> {
      // Geocode obtained coordinates (to a city and a country)
      const geocoderQuery = new URLSearchParams();

      geocoderQuery.append("format", "jsonv2");
      geocoderQuery.append("lat", `${coordinates.latitude}`);
      geocoderQuery.append("lon", `${coordinates.longitude}`);

      const geocoderResponse = await fetch(
        `${CONFIG.url.nominatim_geocoder}/reverse?${geocoderQuery}`,
        {
          mode: "cors"
        }
      );

      if (geocoderResponse.ok !== true) {
        throw new Error("Geocoding request failed");
      }

      const geocoding = (await geocoderResponse.json()) || {};

      if (geocoding.address?.city && geocoding.address?.country_code) {
        return {
          cityName: geocoding.address.city,
          countryCode: geocoding.address.country_code.toUpperCase()
        };
      }

      throw new Error("Geocoding got no result");
    },

    // --> EVENT LISTENERS <--

    async onFieldsetLocationPermissionAllowClick(): Promise<void> {
      try {
        // Obtain geolocation position (this will request for permission if \
        //   needed)
        const coordinates = await this.obtainGeolocationPositionCoordinates();

        // Mark as allowed or disallowed?
        this.geolocationPermission =
          coordinates === null
            ? GeolocationPermission.Disallowed
            : GeolocationPermission.Allowed;
      } catch (error) {
        this.$log.error("Failed obtaining geolocation allow permission", error);

        // Show warning alert
        BaseAlert.warning("Location failed", "Could not obtain permissions");

        // Mark as 'failed to obtain'
        this.geolocationPermission = GeolocationPermission.FailedToObtain;
      }
    },

    async onFieldsetLocationPermissionRefreshClick(): Promise<void> {
      if (this.isRefreshingGeolocationPosition !== true) {
        this.isRefreshingGeolocationPosition = true;

        try {
          // Obtain geolocation position
          const coordinates = await this.obtainGeolocationPositionCoordinates();

          // No geolocation position obtained?
          if (coordinates === null) {
            throw new Error("Coordinates are empty");
          }

          // Geocode obtained coordinates (to a city and a country)
          const address = await this.obtainGeolocationPositionAddress(
            coordinates
          );

          // Update user city and country (in form)
          const form = this.form;

          form.locationCity.inner = address.cityName;
          form.locationCountry.inner = address.countryCode;

          // Show success alert
          BaseAlert.success(
            "Location refreshed",
            "Please save your profile to confirm"
          );
        } catch (error) {
          this.$log.error("Failed obtaining geolocation fresh position", error);

          // Show warning alert
          BaseAlert.warning("Location failed", "Could not geolocate you!");
        } finally {
          this.isRefreshingGeolocationPosition = false;
        }
      }
    }
  }
};
</script>
