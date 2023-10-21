# <picture><source media="(prefers-color-scheme: dark)" srcset="https://github.com/prose-im/prose-app-web/assets/1451907/8e6c83c6-26a0-4505-9561-50a9c97bf236" /><img src="https://github.com/prose-im/prose-app-web/assets/1451907/dd3f7cb4-b156-4ecc-a15f-744dea259e27" alt="prose-app-web" width="150" height="60" /></picture>

[![Test and Lint](https://github.com/prose-im/prose-app-web/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/prose-im/prose-app-web/actions/workflows/test.yml)

**Prose Web application. Built in TypeScript / VueJS.**

The Prose project was originally announced in a blog post: [Introducing Prose, Decentralized Team Messaging in an Era of Centralized SaaS](https://prose.org/blog/introducing-prose/). This project is the Web implementation of the Prose app.

Copyright 2023, Prose Foundation - Released under the [Mozilla Public License 2.0](./LICENSE.md).

_Tested at NodeJS version: `v20.5.0`_

## Architecture

The Prose Web app consists mostly of VueJS views, bound to core libraries, namely the [client](https://github.com/prose-im/prose-core-client) and [views](https://github.com/prose-im/prose-core-views) cores, that are common to all platforms Prose runs on.

The app uses the core client library to connect to XMPP. It calls programmatic methods in order to interact with its internal database and the network. It binds as well to an event bus to receive network events, or update events from the store. Messages are shown in their own view, which is provided by the core views library.

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

#### 📦 Develop with a release core (default)

To build Prose for a development environment (that is, a live development server streaming changes live), hit:

```
npm run dev
```

#### 🔬 Develop with a local core (advanced)

##### ⚙️ Client core

If it is desired to build against a local `prose-core-client` ([repository](https://github.com/prose-im/prose-core-client)) containing a built `prose-sdk-js` package, you may pass a `PROSE_CORE_CLIENT_PATH` environment variable with the relative path to the core client library:

```
PROSE_CORE_CLIENT_PATH="../prose-core-client" npm run dev
```

On a second terminal, you may also watch for changes in the `prose-core-client` repository:

```
find crates bindings/prose-sdk-js/src Cargo.toml | entr -r cargo xtask wasm-pack build --dev
```

Any change happening in the core will trigger a compilation run, which itself will trigger a HMR event in the Web app (this may reload the whole app).

##### 💬 Views core

If you would like to source a local `prose-core-views` ([repository](https://github.com/prose-im/prose-core-views)) build, you may pass a `PROSE_CORE_VIEWS_PATH` environment variable with the relative path to the core views library:

```
PROSE_CORE_VIEWS_PATH="../prose-core-views" npm run dev
```

## Design

![Prose main view](https://github.com/prose-im/prose-app-web/assets/1451907/624bcf38-7406-4194-9aba-924144b6a675)
![Prose profile modal](https://github.com/prose-im/prose-app-web/assets/1451907/e930929b-2fee-4566-86b5-a1b104b39c03)
![Prose login screen](https://github.com/prose-im/prose-app-web/assets/1451907/92af0399-b74a-4321-b66a-a9a64d56b783)

_👉 The Prose Web app reference design [can be found there](https://github.com/prose-im/prose-medley/blob/master/designs/app/prose-app-web.sketch)._

## License

Licensing information can be found in the [LICENSE.md](./LICENSE.md) document.

## :fire: Report A Vulnerability

If you find a vulnerability in any Prose system, you are more than welcome to report it directly to Prose Security by sending an encrypted email to [security@prose.org](mailto:security@prose.org). Do not report vulnerabilities in public GitHub issues, as they may be exploited by malicious people to target production systems running an unpatched version.

**:warning: You must encrypt your email using Prose Security GPG public key: [:key:57A5B260.pub.asc](https://files.prose.org/public/keys/gpg/57A5B260.pub.asc).**
