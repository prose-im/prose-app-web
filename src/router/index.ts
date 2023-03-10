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
  createWebHistory,
  createRouter
} from "vue-router";
import { jid } from "@xmpp/jid";

// PROJECT: VIEWS
import StartLogin from "@/views/start/StartLogin.vue";
import AppBase from "@/views/app/AppBase.vue";
import AppInboxBase from "@/views/app/inbox/AppInboxBase.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * ROUTER
 * ************************************************************************* */

class Router {
  private readonly __router: VueRouter;

  constructor() {
    this.__router = createRouter({
      history: createWebHistory(),

      routes: [
        // --> START <--

        { path: "/start/", redirect: { name: "start.login" } },

        {
          path: "/start/login/",
          name: "start.login",
          component: StartLogin,

          beforeEnter: () => {
            // Ensure that user is not already logged-in
            this.__guardAnonymous();
          }
        },

        // --> APP <--

        {
          path: "/",
          name: "app",
          component: AppBase,

          beforeEnter: () => {
            // Ensure that user is logged-in
            this.__guardAuthenticated();

            // Setup broker client (resume session)
            this.__setupBrokerClient();
          },

          children: [
            {
              path: "inbox/:jid/",
              name: "app.inbox",
              component: AppInboxBase
            }
          ]
        },

        // --> REDIRECT <--

        { path: "/:path(.*)*", redirect: "/" }
      ]
    });
  }

  bind(app: App): void {
    // Bind to app
    app.use(this.__router);
  }

  private __guardAuthenticated() {
    // Ensure that user is logged in (redirect to base if not)
    if (!Store.$account.credentials.jid) {
      this.__router.push({
        name: "start.login"
      });
    }
  }

  private __guardAnonymous() {
    // Ensure that user is not logged-in (redirect to app if so)
    if (Store.$account.credentials.jid) {
      this.__router.push({
        name: "app"
      });
    }
  }

  private __setupBrokerClient() {
    // Authenticate to broker client
    const credentials = Store.$account.credentials;

    Broker.client
      .authenticate(jid(credentials.jid), credentials.password)
      .catch(() => {
        // Ignore authentication errors here
      });
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Router();
