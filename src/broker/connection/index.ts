/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  ProseClientConfig,
  ProseConnectionEventHandler
} from "@prose-im/prose-sdk-js";
import {
  clearInterval as clearWorkerInterval,
  setInterval as setWorkerInterval
} from "worker-timers";

// PROJECT: UTILITIES
import { context as runtimeContext } from "@/utilities/runtime";
import logger from "@/utilities/logger";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const TIMER_PING_INTERVAL_DEFAULT = 90000; // 90 seconds
const TIMER_PING_INTERVAL_APPLICATION = 30000; // 30 seconds
const TIMER_TIMEOUT_INTERVAL = 5000; // 5 seconds

/**************************************************************************
 * CLASS
 * ************************************************************************* */

abstract class BrokerConnection {
  private readonly __config: ProseClientConfig;

  private __pingInterval?: ReturnType<typeof setWorkerInterval>;
  private __timeoutInterval?: ReturnType<typeof setWorkerInterval>;

  protected _eventHandler?: ProseConnectionEventHandler;

  constructor(config: ProseClientConfig) {
    // Assign configuration
    this.__config = config;
  }

  setEventHandler(handler: ProseConnectionEventHandler): void {
    this._eventHandler = handler;

    logger.info("Broker event handler is now active");
  }

  protected _protocol(): string {
    // This method might be overloaded to re-specify a finer protocol
    return "XMPP";
  }

  protected _onInput(data: string): void {
    // Trace raw input?
    if (this.__config.logReceivedStanzas === true) {
      logger.debug(`🔵 ${this._protocol()} IN`, data);
    }

    // Pass to event handler?
    if (this._eventHandler !== undefined) {
      this._eventHandler.handleStanza(data);
    }
  }

  protected _onOutput(data: string): void {
    // Trace raw output?
    if (this.__config.logSentStanzas === true) {
      logger.debug(`🔴 ${this._protocol()} OUT`, data);
    }
  }

  protected _startTimers(): void {
    // Assert that timers did not already fire (this should NEVER happen)
    if (
      this.__pingInterval !== undefined ||
      this.__timeoutInterval !== undefined
    ) {
      throw new Error(
        "Cannot start connection timers: timers already scheduled!"
      );
    }

    // Acquire interval times
    const pingEvery =
      runtimeContext === "application"
        ? TIMER_PING_INTERVAL_APPLICATION
        : TIMER_PING_INTERVAL_DEFAULT;
    const timeoutEvery = TIMER_TIMEOUT_INTERVAL;

    // Schedule timers
    // Important: use a reliable interval scheduler, that will definitely fire \
    //   whenever the event loop is put into background mode due to user \
    //   inactivity. This uses a Web Worker, which manages interval away from \
    //   the main thread and therefore is not subject to pauses.
    this.__pingInterval = setWorkerInterval(() => {
      this._eventHandler?.handlePingTimer();
    }, pingEvery);

    this.__timeoutInterval = setWorkerInterval(() => {
      this._eventHandler?.handleTimeoutTimer();
    }, timeoutEvery);

    logger.debug(
      `Broker started connection timers ` +
        `(ping -> ${pingEvery}ms, timeout -> ${timeoutEvery}ms)`
    );
  }

  protected _stopTimers(): void {
    // Clear all running intervals
    if (this.__pingInterval !== undefined) {
      clearWorkerInterval(this.__pingInterval);
    }
    if (this.__timeoutInterval !== undefined) {
      clearWorkerInterval(this.__timeoutInterval);
    }

    // Reset interval markers
    delete this.__pingInterval;
    delete this.__timeoutInterval;

    logger.debug("Broker stopped connection timers");
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerConnection;
