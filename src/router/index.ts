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
import InitiateLogin from "../views/initiate/InitiateLogin.vue";
import AppBase from "../views/app/AppBase.vue";

/**************************************************************************
 * VIEWS
 * ************************************************************************* */

// TODO

/**************************************************************************
 * ROUTER
 * ************************************************************************* */

const router = createRouter({
  history: createWebHistory(),

  routes: [
    // --> INITIATE <--

    { path: "/initiate/login/", component: InitiateLogin },

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
