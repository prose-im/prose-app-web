# prose-app-web

[![Test and Lint](https://github.com/prose-im/prose-app-web/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/prose-im/prose-app-web/actions/workflows/test.yml)

**Prose Web application. Built in TypeScript / VueJS.**

Copyright 2023, Prose Foundation - Released under the [Mozilla Public License 2.0](./LICENSE.md).

_Tested at NodeJS version: `v20.5.0`_

## Architecture

The Prose Web app consists mostly of VueJS views, bound to core libraries, namely the [views](https://github.com/prose-im/prose-core-views), that are common to all platforms Prose runs on.

The app uses its own internal client to connect to XMPP. It calls programmatic methods in order to interact with its internal database and the network. It binds as well to an event bus to receive network events, or update events from the store. Messages are shown in their own view, which is provided by the core views library.

This decoupling makes things extremely clean, and enables common code sharing between platforms (eg. Web, macOS, etc.).

## Installation

To install all the build dependencies, you first need to install NodeJS (version `12` and above).

Then, hit:

```
npm install
```

## Build

Building the Prose Web app is done per-target environment. Please check below for build instructions based on your target environment.

### Production target

To build Prose for a production environment (with all optimizations, meaning the build will be slower), hit:

```
npm run build
```

### Development target

To build Prose for a development environment (that is, a live development server streaming changes live), hit:

```
npm run dev
```

## Design

_👉 The Prose Web app reference design [can be found there](https://github.com/prose-im/prose-medley/blob/master/designs/app/prose-app-web.sketch)._

## License

Licensing information can be found in the [LICENSE.md](./LICENSE.md) document.

## :fire: Report A Vulnerability

If you find a vulnerability in any Prose system, you are more than welcome to report it directly to Prose Security by sending an encrypted email to [security@prose.org](mailto:security@prose.org). Do not report vulnerabilities in public GitHub issues, as they may be exploited by malicious people to target production systems running an unpatched version.

**:warning: You must encrypt your email using Prose Security GPG public key: [:key:57A5B260.pub.asc](https://files.prose.org/public/keys/gpg/57A5B260.pub.asc).**
