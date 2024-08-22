
if ([
  process.env.TOKEN,
  process.env.NFT,
  process.env.CONTRACT,
  process.env.BACKEND_WALLET,
  process.env.AUTH_KEY,
  process.env.ENGINE_ACCESS_TOKEN
].some(v => v === undefined)) {
  throw new Error("Not all configuration variables are set. Please check your config and try again. Thanks for calling.")
}



export const ENGINE_URL = new URL(process.env.ENGINE_URL!);
export const TOKEN = process.env.TOKEN;
export const NFT = process.env.NFT;
export const CONTRACT = process.env.CONTRACT;
export const BACKEND_WALLET = process.env.BACKEND_WALLET;
export const AUTH_KEY = process.env.AUTH_KEY;
export const ENGINE_ACCESS_TOKEN = process.env.ENGINE_ACCESS_TOKEN;
