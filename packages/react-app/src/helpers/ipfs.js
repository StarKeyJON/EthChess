import { create } from "ipfs-http-client";
import { BufferList } from "bl";
export const ipfs = create({ host: "pharout_labs_pinata.mypinata.cloud", port: "5001", protocol: "https" });

export async function addToIPFS(file) {
  if (file != typeof String) {
    file = JSON.stringify(file);
  }
  const fileAdded = await ipfs.add(file);

  return fileAdded;
}

export function urlFromCID(cid) {
  return `https://pharout_labs_pinata.mypinata.cloud/ipfs/${cid}`;
}

export async function getFromIPFS(hashToGet) {
  for await (const file of ipfs.cat(hashToGet)) {
    const content = new BufferList(file).toString();

    return content;
  }
}
