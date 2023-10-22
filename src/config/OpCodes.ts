/**
 * OpCodes will be used to determine what data is being sent and recieved throughout strafe.
 */
export enum OpCodes {
  /**
   * Recieved whenever an event was dispatched.
   * Recieve
   */
  DISPATCH = 0,

  /**
   * Fired periodically by a user to keep the connection alive.
   * Send/Recieve
   */
  HEARTBEAT = 1,

  /**
   * Starts a new session during the initial handshake (Checks if authentication is initially correct).
   * Send
   */
  IDENTIFY = 2,

  /**
   * Recieved whenever there is an update to a user's presence.
   * Send
   */
  PRESENCE_UPDATE = 3,

  /**
   * 	Sent to join/leave or move between voice channels.
   * Send
   */
  VOICE_STATE_UPDATE = 4,

  /**
   * Resume a previous session that was disconnected.
   * Send
   */
  RESUME = 5,

  /**
   * You should attempt to reconnect and resume immediately when you get this opcode.
   * Recieve
   */
  RECONNECT = 6,

  /**
   * Request information about offline guild members in a large guild.
   * Send
   */
  REQUEST_GUILD_MEMBERS = 7,

  /**
   * The session has been invalidated. You should reconnect and identify/resume accordingly.
   * Recieve
   */
  INVALID_SESSION = 8,

  /**
   * Sent immediately after connecting, contains the `heartbeat_interval` to use.
   * Recieve
   */
  HELLO = 9,

  /**
   * Sent in response to receiving a heartbeat to acknowledge that it has been received.
   * Recieve
   */
  HEARTBEAT_ACK = 10,
}
