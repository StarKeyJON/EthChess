const peers = process.env.PEERS;
// const awsKey = process.env.SERVER_ACCESS_KEY_ID;
// const awsSecret = process.env.SERVER_SECRET_ACCESS_KEY;
// const awsBucket = process.env.SERVER_BUCKET;
const gun_config = {
  axe: false,
  localStorage: false,
  peers: peers,
  // s3: {
  //   key: awsKey, // AWS Access Key
  //   secret: awsSecret, // AWS Secret Token
  //   bucket: awsBucket, // The bucket you want to save into
  // },
};

module.exports = { gun_config };
