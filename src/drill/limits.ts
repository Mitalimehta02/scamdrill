// Size limits shared by the browser and the server, so they can't drift apart (spec.md > Quick Replies and Reply Limit).

/** The reply box accepts at most this many characters. */
export const MAX_REPLY_CHARS = 300;
/** Show the character counter from here on. */
export const REPLY_COUNTER_FROM = 240;
/** The server rejects any history message longer than this (twice the reply cap, for scammer lines). */
export const SERVER_MAX_TEXT = 600;
/** The server's JSON body limit. Hindi is 3 bytes per character in UTF-8. */
export const SERVER_BODY_LIMIT_BYTES = 12 * 1024;
