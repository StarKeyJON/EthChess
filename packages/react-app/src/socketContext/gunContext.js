/**
 * Gun DB initialization and basic methods
 * @module useGun
 */
import React from "react";
import Gun from "gun";
import { SEA } from "gun/sea";
import "gun/lib/yson.js";
// polyfiils for Gun 0.2020.1236
import { Buffer } from "buffer";
import { peers } from "../constants";
window.Buffer = Buffer;
window.setImmediate = setTimeout;

const awsKey = process.env.REACT_APP_ACCESS_KEY_ID;
const awsSecret = process.env.REACT_APP_SECRET_ACCESS_KEY;
const awsBucket = process.env.REACT_APP_BUCKET;
const gunOptions = {
  axe: false,
  localStorage: false,
  s3: {
    key: awsKey, // AWS Access Key
    secret: awsSecret, // AWS Secret Token
    bucket: awsBucket, // The bucket you want to save into
  },
};

export const GunContext = React.createContext();
/** The main Gun instance for database operations */
export let gun;

/**
 * Instantiate a Gun instance for DB manipulations
 * @param {Object} options - options for this gun instance, like { localstorage:true }
 * @returns {Gun}
 * @example
 * import { useGun } from '@pharout_bridge/react'
 *
 * const gun = useGun()
 */

export function useGun() {
  gun = Gun({ peers: peers, ...gunOptions });
  return gun;
}

export { SEA };
