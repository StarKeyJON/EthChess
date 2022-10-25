/**
 * Gun DB initialization and basic methods
 * @module useGun
 */

import Gun from "gun/gun";
import { SEA } from "gun/sea";
import "gun/lib/yson.js";
// polyfiils for Gun 0.2020.1236
import { Buffer } from "buffer";
window.Buffer = Buffer;
window.setImmediate = setTimeout;

/** The main Gun instance for database operations */
export let gun;

/** Secondary Gun instance for key management */
export let gun2;

/**
 * Instantiate a Gun instance for DB manipulations
 * @param {Object} options - options for this gun instance, like { localstorage:true }
 * @returns {Gun}
 * @example
 * import { useGun } from '@pharout_bridge/react'
 *
 * const gun = useGun()
 */

export function useGun(peers, options) {
  gun = Gun({ peers: peers, ...options });
  return gun;
}

/**
 * get a secondary Gun instance for certificate management
 * @param {object} options - options for this gun instance, like { localstorage:true }
 * @returns {Gun}
 */

export function useGun2(peers, opts = { localStorage: false }) {
  if (!gun2) {
    gun2 = Gun({ peers: peers, ...opts });
  }
  return gun2;
}

/**
 * SEA library
 * @constant SEA
 */
export { SEA };

/**
 * **Get a soul for any given node**
 * A wrapper for `Gun.node.soul`
 * @function soul
 */
export const soul = Gun?.node?.soul;

/**
 * **Generate a random UUID**
 * A wrapper for `Gun.text.random`
 * @function genUUID
 */
export const genUUID = Gun?.text?.random;
