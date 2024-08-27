import type { Address } from "viem";

if ([
  process.env.TOKEN,
  process.env.NFT,
  process.env.CONTRACT,
  process.env.BACKEND_WALLET,
  process.env.AUTH_KEY,
  process.env.ENGINE_ACCESS_TOKEN,
  process.env.ENGINE_URL,
  process.env.RPC_URL,
].some(v => v === undefined)) {
  throw new Error("Not all configuration variables are set. Please check your config and try again. Thanks for calling.");
}

export const ENGINE_URL = new URL(process.env.ENGINE_URL!);
export const TOKEN = process.env.TOKEN as Address;
export const NFT = process.env.NFT as Address;
export const CONTRACT = process.env.CONTRACT as Address;
export const BACKEND_WALLET = process.env.BACKEND_WALLET as Address;
export const AUTH_KEY = process.env.AUTH_KEY!;
export const ENGINE_ACCESS_TOKEN = process.env.ENGINE_ACCESS_TOKEN!;
export const RPC_URL = process.env.RPC_URL!;
