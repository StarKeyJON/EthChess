const awsKey = process.env.SERVER_ACCESS_KEY_ID;
const awsSecret = process.env.SERVER_SECRET_ACCESS_KEY;
const awsBucket = process.env.SERVER_BUCKET;
const peers = process.env.PEERS;

export const gun_config = {
  peers: peers,
  axe: false,
  rad: false,
  localStorage: false,
  s3: {
    key: awsKey, // AWS Access Key
    secret: awsSecret, // AWS Secret Token
    bucket: awsBucket, // The bucket you want to save into
  },
};
