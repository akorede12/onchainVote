import { ethers } from "ethers";

async function parseBytes(args) {
  // const bytes = args[0];
  const name = ethers.utils.parseBytes32String(args); // args bytes
  console.log("name: ", name);
  return name;
}

async function createBytes(args) {
  const name = args[0];
  const bytes = ethers.utils.formatBytes32String(name);
  console.log("Bytes: ", bytes);
  return bytes;
}

// async function parseBytes(args) {
//   const bytes = args[0];
//   const byteSequence = ethers.utils.arrayify(bytes);
//   const name = await ethers.utils.parseBytes32String(byteSequence);
//   console.log("name: ", name);
//   return name;
// }
export { parseBytes, createBytes };
