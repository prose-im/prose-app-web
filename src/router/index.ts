/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { App } from "vue";
import {
  Router as VueRouter,
  createRouter,
  createWebHistory
} from "vue-router";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: VIEWS
import AppBase from "@/views/app/AppBase.vue";
import AppIndex from "@/views/app/AppIndex.vue";
import AppInboxBase from "@/views/app/inbox/AppInboxBase.vue";
import StartLogin from "@/views/start/StartLogin.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum NavigateState {
  // Forwards direction.
  Forwards = "forwards",
  // Backwards direction.
  Backwards = "backwards"
}

/**************************************************************************
 * ROUTER
 * ************************************************************************* */

class Router {
  private readonly __router: VueRouter;

  private __lastNavigateStatePosition = 0;
  private __pendingNavigateState: NavigateState | null = null;

  constructor() {
    // Create router
    this.__router = createRouter({
      history: createWebHistory(),

      routes: [
        // --> START <--

        { path: "/start/", redirect: { name: "start.login" } },

        {
          path: "/start/login/",
          name: "start.login",
          component: StartLogin,

          beforeEnter: async (_to, _from, next) => {
            try {
              await this.__guardAnonymous();
            } catch (_) {
              logger.warn(
                "Cannot route to the start login, user already logged in"
              );
            }

            next();
          }
        },

        // --> APP <--

        {
          path: "/",
          name: "app",
          component: AppBase,

          beforeEnter: async (_to, _from, next) => {
            try {
              await this.__guardAuthenticated();
            } catch (_) {
              logger.warn("Cannot route to the app, user not logged in");
            }

            // Important: do not await here, as this would block routing while \
            //   the broker client is connecting to the network. We want this \
            //   to be done in the background while the app is already showing \
            //   on screen for the user.
            this.__setupBrokerClient();

            next();
          },

          children: [
            {
              path: "",
              name: "app.index",
              component: AppIndex
            },

            {
              path: "inbox/:roomId/",
              name: "app.inbox",
              component: AppInboxBase
            }
          ]
        },

        // --> REDIRECT <--

        { path: "/:path(.*)*", redirect: "/" }
      ]
    });

    // Bind router events
    this.__bindEvents(this.__router);
  }

  bind(app: App): void {
    // Bind to app
    app.use(this.__router);
  }

  private async __guardAuthenticated(): Promise<void> {
    // Ensure that user is logged in (redirect to base if not)
    if (!Store.$account.credentials.jid) {
      this.__router.push({
        name: "start.login"
      });

      return Promise.reject();
    }
  }

  private async __guardAnonymous(): Promise<void> {
    // Ensure that user is not logged-in (redirect to app if so)
    if (Store.$account.credentials.jid) {
      this.__router.push({
        name: "app"
      });

      return Promise.reject();
    }
  }

  private async __setupBrokerClient(): Promise<void> {
    // Authenticate to broker client
    const credentials = Store.$account.credentials;

    if (credentials.jid) {
      try {
        // Authenticate client
        await Broker.client.authenticate(
          new JID(credentials.jid),
          credentials.password
        );

        // Start observers
        await Broker.client.observe();
      } catch (error) {
        // Ignore authentication errors here
        logger.error("Error setting up broker client", error);
      }
    }
  }

  private __bindEvents(router: VueRouter) {
    // Initialize initial navigation position
    if (history.state !== null) {
      this.__lastNavigateStatePosition = history.state.position;
    }

    // Bind to window history events
    window.addEventListener("popstate", event => {
      if (event.state !== null) {
        // Reset pending navigation state first
        this.__pendingNavigateState = null;

        // Assign pending navigation state (as needed)
        if (event.state.position < this.__lastNavigateStatePosition) {
          this.__pendingNavigateState = NavigateState.Backwards;
        } else if (event.state.position > this.__lastNavigateStatePosition) {
          this.__pendingNavigateState = NavigateState.Forwards;
        }

        // Handle history change straight away
        // Notice: this cannot be done in 'router.afterEach' due to the the \
        //   'popstate' event firing AFTER 'router.afterEach' fires, therefore \
        //   the marker has no time to be set.
        switch (this.__pendingNavigateState) {
          case NavigateState.Backwards: {
            // Move to previous in history
            Store.$history.movePrevious();

            break;
          }

          case NavigateState.Forwards: {
            // Move to next in history
            Store.$history.moveNext();

            break;
          }
        }

        // Assign new position in state
        this.__lastNavigateStatePosition = event.state.position;
      }
    });

    history.pushState = new Proxy(history.pushState, {
      apply: (target, self, data: any) => {
        // Update navigation state (always reset, as we are navigating)
        this.__pendingNavigateState = null;
        this.__lastNavigateStatePosition = data[0].position;

        // Trigger original 'pushState'
        return target.apply(self, data);
      }
    });

    // Bind to router events
    router.afterEach(to => {
      // Update current history?
      if (to && to.name) {
        // No navigation state pending, meaning the route changes by pushing \
        //   the state.
        if (this.__pendingNavigateState === null) {
          Store.$history.setCurrent(to.name as string, to.params);
        }
      }

      // Reset pending navigation state
      this.__pendingNavigateState = null;
    });
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Router();
