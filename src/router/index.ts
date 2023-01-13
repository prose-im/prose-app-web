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

/**************************************************************************
 * ROUTER
 * ************************************************************************* */

const router = createRouter({
  history: createWebHistory(),

  routes: [
    // --> START <--

    { path: "/start/login/", component: StartLogin },

    // --> APP <--

    { path: "/", component: AppBase },

    // --> REDIRECT <--

    { path: "/:path(.*)*", redirect: "/" }
  ]
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default router;
