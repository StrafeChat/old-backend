/**
 * OpCodes will be used to determine what data is being sent and recieved throughout strafe.
 */
export enum WsOpCodes {
  /**
   * Recieved whenever an event was dispatched.
   * Sent by server
   */
  DISPATCH = 0,

  /**
   * Fired periodically by a user to keep the connection alive.
   * Sent by client and server
   */
  HEARTBEAT = 1,

  /**
   * Starts a new session during the initial handshake (Checks if authentication is initially correct).
   * Sent by client
   */
  IDENTIFY = 2,

  /**
   * Recieved whenever there is an update to a user's presence.
   * Sent by client
   */
  PRESENCE_UPDATE = 3,

  /**
   * 	Sent to join/leave or move between voice channels.
   * Sent by client
   */
  VOICE_STATE_UPDATE = 4,

  /**
   * Resume a previous session that was disconnected.
   * Sent by client
   */
  RESUME = 5,

  /**
   * You should attempt to reconnect and resume immediately when you get this opcode.
   * Sent by server
   */
  RECONNECT = 6,

  /**
   * Request information about offline guild members in a large guild.
   * Sent by client
   */
  REQUEST_GUILD_MEMBERS = 7,

  /**
   * The session has been invalidated. You should reconnect and identify/resume accordingly.
   * Sent by server
   */
  INVALID_SESSION = 8,

  /**
   * Sent immediately after connecting, contains the `heartbeatInterval` to use.
   * Sent by server
   */
  HELLO = 9,

  /**
   * Sent in response to receiving a heartbeat to acknowledge that it has been received.
   * Sent by server
   */
  HEARTBEAT_ACK = 10,
}

export enum VoiceOpCodes {
  /**
   * Begin a voice websocket connection.
   * Sent by client
   */
  IDENTIFY = 0,

  /**
   * Select the voice protocol.
   * Sent by client
   */
  SELECT_PROTOCOL = 1,

  /**
   * Complete the websocket handshake.
   * Sent by server
   */
  READY = 2,

  /**
   * Keep the websocket connection alive.
   * Sent by client
   */
  HEARTBEAT = 3,

  /**
   * Describe the session.
   * Sent by server
   */
  SESSION_DESCRIPTION = 4,

  /**
   * Indicate which users are speaking.
   * Sent by client and server
   */
  SPEAKING = 5,

  /**
   * Sent to acknowledge a received client heartbeat.
   * Sent by server
   */
  HEARTBEAT_ACK = 6,

  /**
   * Resume a connection.
   * Sent by client
   */
  RESUME = 7,

  /**
   * Time to wait between sending heartbeats in milliseconds.
   * Sent by server
   */
  HELLO = 8,

  /**
   * Acknowledge a successful session resume.
   * Sent by server
   */
  RESUMED = 9,

  /**
   * A client has disconnected from the voice channel.
   * Sent by server
   */
  CLIENT_DISCONNECT = 10,
}
