/*
 * This file is part of prose-app-web
 *
 * Copyright 2025, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

export enum GeolocationPermission {
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

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface GeolocationPositionCoordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationPositionAddress {
  cityName: string;
  countryCode: string;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const GEOLOCATION_ACQUIRE_STALE_AGE = 300000; // 5 minutes
const GEOLOCATION_ACQUIRE_TIMEOUT = 10000; // 10 seconds

/**************************************************************************
 * GEOLOCATION
 * ************************************************************************* */

class UtilitiesGeolocation {
  async permission(): Promise<GeolocationPermission> {
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
  }

  async grant(): Promise<boolean> {
    // User granted permission? (received coordinates)
    if ((await this.coordinates()) !== null) {
      return true;
    }

    // User did not grant permission
    return false;
  }

  async coordinates(): Promise<GeolocationPositionCoordinates | null> {
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
  }

  async address(
    coordinates: GeolocationPositionCoordinates
  ): Promise<GeolocationPositionAddress | null> {
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

    return null;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new UtilitiesGeolocation();
