export enum WsErrors {
  /**
   * Something went wrong and we don't know what happend. Try reconnecting?
   */
  UNKNOWN_ERROR = 4000,

  /**
   * You sent an invalid Gateway opcode.
   */
  UNKNOWN_OPCODE = 4001,

  /**
   * You sent an invalid payload.
   */
  DECODE_ERROR = 4002,

  /**
   * You sent us a payload before identifying.
   */
  NOT_AUTHENTICATED = 4003,

  /**
   * The account token sent with your identify payload is incorrect.
   */
  AUTHENTICATION_FAILED = 4004,

  /**
   * You sent more than one identify payload. You are already logged in!
   */
  ALREADY_AUTHENTICATED = 4005,

  /**
   * The sequence sent when resuming the session was invalid. You should reconnect and start a new session.
   */
  INVALID_SEQUENCE = 4006,

  /**
   * You're sending payloads to us too quickly. Slow it down! You will be disconnected on receiving this.
   */
  RATE_LIMITED = 4007,

  /**
   * Your session timed out. Reconnect and start a new one.
   */
  SESSION_TIMED_OUT = 4008,

  /**
   * You sent us an invalid shard when identifying.
   */
  INVALID_SHARD = 4009,

  /**
   * The session would have handled too many guilds - you are required to shard your connection in order to connect.
   */
  SHARDING_REQUIRED = 4010,

  /**
   * You sent an invalid version for the gateway.
   */
  INVALID_API_VERSION = 4011,

  /**
   * You sent an invalid intent for a Gateway Intent. You may have incorrectly calculated the bitwise value.
   */
  INVALID_INTENTS = 4012,

  /**
   * You sent a disallowed intent for a Gateway Intent. You may have tried to specify an intent that you have not enabled or are not approved for.
   */
  DISALLOWED_INTENTS = 4013,
}

export enum VoiceErrors {
  /**
   * You sent an invalid opcode.
   */
  UNKNOWN_OPCODE = 4001,

  /**
   * You sent an invalid payload in your identifying to the Gateway.
   */
  FAILED_TO_DECODE_PAYLOAD = 4002,

  /**
   * You sent a payload before identifying with the Gateway.
   */
  NOT_AUTHENTICATED = 4003,

  /**
   * The token you sent in your identify payload is incorrect.
   */
  AUTHENTICATION_FAILED = 4004,

  /**
   * You sent more than one identify payload.
   */
  ALREADY_AUTHENTICATED = 4005,

  /**
   * You sent more than one identify payload.
   */
  SESSION_NO_LONGER_VALID = 4006,

  /**
   * Your session has timed out.
   */
  SESSION_TIMEOUT = 4007,

  /**
   * We can't find the server you're trying to connect to.
   */
  SERVER_NOT_FOUND = 4008,

  /**
   * We didn't recognize the protocol you sent.
   */
  UNKNOWN_PROTOCOL = 4009,

  /**
   * Channel was deleted, you were kicked, voice server changed, or the main gateway session was dropped. Should not reconnect.
   */
  DISCONNECTED = 4010,

  /**
   * The server crashed. Our bad! Try resuming.
   */
  VOICE_SERVER_CRASHED = 4011,

  /**
   * We didn't recognize your encryption.
   */
  UNKNOWN_ENCRYPTION_MODE = 4012,
}
