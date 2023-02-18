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

// PROJECT: VIEWS
import StartLogin from "@/views/start/StartLogin.vue";
import AppBase from "@/views/app/AppBase.vue";
import AppInboxBase from "@/views/app/inbox/AppInboxBase.vue";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * ROUTER
 * ************************************************************************* */

class Router {
  private __router: VueRouter;

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
          },

          children: [
            {
              path: "inbox/",
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
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Router();
