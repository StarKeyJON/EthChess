import { create } from "ipfs-http-client";
import { BufferList } from "bl";
import { appStage } from "../constants";
const projectId = process.env.REACT_APP_IPFS_ID;
const projectSecret = process.env.REACT_APP_IPFS_SECRET;
const authorization = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});

export async function AddToIPFS(file) {
  if (appStage === "production") {
    if (file != typeof String) {
      file = JSON.stringify(file);
    }
    const fileAdded = await ipfs.add(file);
    return fileAdded;
  } else {
    return "Development Stage!";
  }
}

export function urlFromCID(cid) {
  return `https://pharout_labs_pinata.mypinata.cloud/ipfs/${cid}`;
}

export async function GetFromIPFS(hashToGet) {
  for await (const file of ipfs.cat(hashToGet)) {
    const content = new BufferList(file).toString();

    return content;
  }
}
