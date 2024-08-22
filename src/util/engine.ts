import Debug from "debug";
import { formatEther, maxUint256 } from "viem";
import { BACKEND_WALLET, CONTRACT, ENGINE_ACCESS_TOKEN, ENGINE_URL, NFT, TOKEN } from "./constants";

const debug = Debug("tappyfowl-api:server");
type ERC20BalanceOfResult = {
  result: {
    name: string;
    symbol: string;
    decimals: string;
    value: string;
    displayValue: string;
  }
}
const baseHeaders = { authorization: `Bearer ${ENGINE_ACCESS_TOKEN}` };

const headers = { ...baseHeaders, "x-backend-wallet-address": BACKEND_WALLET };
const accountHeaders = (account: `0x${string}` | string) => (
  { ...headers, "x-account-address": account }
);

export const getERC20Balance = async (chainId: string | number, token: `0x${string}`, wallet: `0x${string}`) => {
  const url = new URL(`/contract/${chainId}/${TOKEN}/erc20/balance-of`, ENGINE_URL);
  debug("%s", url.toString())
  url.searchParams.set("wallet_address", wallet);
  const resp = await fetch(url, { headers: baseHeaders });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const data: ERC20BalanceOfResult = await resp.json();
  return formatEther(BigInt(data.result.value));
};

export const getERC1155Balance = async (chainId: string | number, token: `0x${string}`, wallet: `0x${string}`) => {
  const url = new URL(`/contract/${chainId}/${NFT}/erc1155/balance-of`, ENGINE_URL);
  url.searchParams.set("walletAddress", wallet);
  url.searchParams.set("tokenId", "0");
  const resp = await fetch(url, { headers: baseHeaders });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const data: { result: string } = await resp.json();
  return data.result;
};

type ResultData = {
  address: `0x${string}`
  highScore: number | string
  tokens: number | string
}
export const sendResult = async (chainId: string | number, token: `0x${string}`, data: ResultData) => {
  const url1 = new URL(`/contract/${chainId}/${token}/erc20/mint-to`, ENGINE_URL);
  const resp1 = await fetch(url1, {
    method: "POST",
    headers,
    body: JSON.stringify({ tonAddress: data.address, "amount": String(data.tokens) }),
  });
  console.log(resp1.json());
  const url2 = new URL(`/contract/${chainId}/${CONTRACT}/write`, ENGINE_URL);
  const resp2 = await fetch(url2, {
    method: "POST",
    headers,
    body: JSON.stringify({
      functionName: "submitResult",
      args: [ data.address, data.highScore ],
    }),
  });
  console.log(resp2.json());
};

type BuyData = {
  address: `0x${string}`
  id: number | string
}

export const buyCharacter = async (
  chainId: string | number,
  token: `0x${string}`,
  data: BuyData,
) => {
  const allowance = await getTokenAllowance(chainId, TOKEN, data.address);
  if (allowance < maxUint256) {
    await setMaxTokenAllowance(chainId, token, data.address);
  }
  const url = new URL(`/contract/${chainId}/${token}/erc1155/claim-to`, ENGINE_URL);
  const resp = await fetch(url, {
    method: "POST",
    headers: accountHeaders(data.address),
    body: JSON.stringify({ receiver: data.address, tokenId: data.id, quantity: 1 }),
  });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
};

export const getTokenAllowance = async (chainId: string | number, token: `0x${string}`, account: `0x${string}`) => {
  const url = new URL(`/contract/${chainId}/${token}/erc20/allowance-of`, ENGINE_URL);
  url.searchParams.set("ownerWallet", account);
  url.searchParams.set("spenderWallet ", CONTRACT);
  const resp = await fetch(url, { headers: baseHeaders });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const data: { result: Record<string, string> & { value: string } } = await resp.json();

  return BigInt(data.result.value);
};

export const setMaxTokenAllowance = async (chainId: string | number, token: `0x${string}`, account: `0x${string}`) => {
  const url = new URL(`/contract/${chainId}/${token}/erc20/set-allowance`, ENGINE_URL);
  const resp = await fetch(url, {
    method: "POST",
    headers: accountHeaders(account),
    body: JSON.stringify({ spenderAddress: CONTRACT, amount: formatEther(maxUint256) }),
  });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
};
