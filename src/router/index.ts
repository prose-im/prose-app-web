/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { createWebHistory, createRouter } from "vue-router";

// PROJECT: VIEWS
import StartLogin from "../views/start/StartLogin.vue";
import AppBase from "../views/app/AppBase.vue";
import AppInboxBase from "../views/app/inbox/AppInboxBase.vue";

/**************************************************************************
 * ROUTER
 * ************************************************************************* */

const router = createRouter({
  history: createWebHistory(),

  routes: [
    // --> START <--

    { path: "/start/", redirect: { name: "start.login" } },
    { path: "/start/login/", name: "start.login", component: StartLogin },

    // --> APP <--

    {
      path: "/",
      name: "app",
      component: AppBase,

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

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default router;
