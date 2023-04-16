/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import sha1 from "sha1";
import { firstBy } from "thenby";

// PROJECT: BROKER
import { CAPS_NODE } from "@/broker/stanzas/presence";
import {
  DISCO_FEATURES,
  DISCO_CATEGORY,
  DISCO_TYPE,
  DISCO_NAME,
  DISCO_XML_LANG
} from "@/broker/stanzas/iq";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type CapsIdentities = Array<CapsIdentity>;
type CapsFeatures = Array<string>;
type CapsDataForms = Array<CapsDataForm>;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface CapsIdentity {
  category: string;
  type: string;
  name?: string;
  "xml:lang"?: string;
}

interface CapsDataForm {
  formType: string;
}

interface CapsAttributes {
  hash: string;
  node: string;
  verification: string;
}

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerBuilderCaps {
  // XEP-0115: Entity Capabilities
  // https://xmpp.org/extensions/xep-0115.html

  attributes(): CapsAttributes {
    return {
      hash: "sha-1",
      node: CAPS_NODE,

      verification: sha1(
        this.__verificationString(
          this.__localIdentities(),
          this.__localFeatures(),
          this.__localDataForms()
        )
      )
    };
  }

  private __verificationString(
    identities: CapsIdentities,
    features: CapsFeatures,
    dataforms: CapsDataForms
  ): string {
    const parts: Array<string> = [];

    // Sort input data
    identities.sort(firstBy("category").thenBy("type").thenBy("xml:lang"));
    features.sort();
    dataforms.sort(firstBy("formType"));

    // Append identities
    identities.forEach(identity => {
      parts.push(
        [
          identity.category,
          identity.type,
          identity["xml:lang"] || "",
          identity.name || ""
        ].join("/")
      );
    });

    // Append features
    features.forEach(feature => {
      parts.push(feature);
    });

    // Append data forms
    // TODO: needs to be implemented please

    // TODO
    console.error("==> parts = ", parts);

    // Close parts
    parts.push("");

    // Generate capabilities string
    const caps = parts.join("<");

    // TODO
    console.error("==> caps = ", caps);

    // TODO: fix wrong caps being generated (apparently)
    return caps;
  }

  private __localIdentities(): CapsIdentities {
    return [
      {
        category: DISCO_CATEGORY,
        name: DISCO_NAME,
        type: DISCO_TYPE,
        "xml:lang": DISCO_XML_LANG
      }
    ];
  }

  private __localFeatures(): CapsFeatures {
    // Notice: clone array (as it might get mutated)
    return Array.from(DISCO_FEATURES);
  }

  private __localDataForms(): CapsDataForms {
    // Nothing here (just yet)
    return [];
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BrokerBuilderCaps();
