import Debug from "debug";
import { type Address, formatEther, maxUint256 } from "viem";
import { BACKEND_WALLET, CONTRACT, ENGINE_ACCESS_TOKEN, ENGINE_URL, NFT, TOKEN } from "./constants";
import { getEnsName } from "./viem";

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
const baseHeaders = { "Content-Type": "application/json", authorization: `Bearer ${ENGINE_ACCESS_TOKEN}` };

const headers = { ...baseHeaders, "x-backend-wallet-address": BACKEND_WALLET };
const accountHeaders = (account: Address | string) => (
  { ...headers, "x-account-address": account }
);

export const getERC20Balance = async (chainId: string | number, token: Address, wallet: Address) => {
  debug("Get ERC20 Balance Called: ChainID: %d | Token: %s | Wallet: %s", chainId, token, wallet);
  const url = new URL(`/contract/${chainId}/${TOKEN}/erc20/balance-of`, ENGINE_URL);
  debug("%s", url.toString());
  url.searchParams.set("wallet_address", wallet);
  const resp = await fetch(url, { headers: baseHeaders });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const data: ERC20BalanceOfResult = await resp.json();
  return formatEther(BigInt(data.result.value));
};

export const getERC1155Balance = async (chainId: string | number, token: Address, wallet: Address) => {
  debug("Get ERC1155 Balance Called: ChainID: %d | Token: %s | Wallet: %s", chainId, token, wallet);
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
  address: Address
  highScore: number | string
  tokens: number | string
}
export const sendResult = async (chainId: string | number, token: Address, data: ResultData) => {
  debug("send result called: ChainID: %d | Token: %s | Data: %s", chainId, token, JSON.stringify(data));
  const url1 = new URL(`/contract/${chainId}/${token}/erc20/mint-to`, ENGINE_URL);
  const resp1 = await fetch(url1, {
    method: "POST",
    headers,
    body: JSON.stringify({ toAddress: data.address, amount: String(data.tokens) }),
  });
  debug("Mint To Response: %s", await resp1.text());
  const url2 = new URL(`/contract/${chainId}/${CONTRACT}/write`, ENGINE_URL);
  const body = JSON.stringify({ functionName: "submitResult", args: [ data.address, data.highScore ] });
  const resp2 = await fetch(url2, { method: "POST", headers, body });
  debug("Write High Score Response: %s", await resp2.text());
};

type BuyData = {
  account: Address
  id: number | string
}

export const buyCharacter = async (
  chainId: string | number,
  token: Address,
  nft: Address,
  data: BuyData,
) => {
  debug(
    "Buy Character called: ChainID: %d | TOKEN: %s | NFT: %s | Account: %s | ID: %d",
    chainId,
    token,
    nft,
    data.account,
    data.id,
  );
  const allowance = await getTokenAllowance(chainId, token, nft, data.account);
  if (allowance < maxUint256) {
    await setMaxTokenAllowance(chainId, token, nft, data.account);
  }
  const url = new URL(`/contract/${chainId}/${nft}/erc1155/claim-to`, ENGINE_URL);
  const resp = await fetch(url, {
    method: "POST",
    headers: accountHeaders(data.account),
    body: JSON.stringify({ receiver: data.account, tokenId: data.id, quantity: 1 }),
  });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  debug("Buy Character result: %s", await resp.text());
};

export const getTokenAllowance = async (
  chainId: string | number, token: Address, spender: Address, account: Address) => {
  debug(
    "Get Token Allowance called: ChainID: %d | Token: %s | Spender: %s | Account: %s",
    chainId,
    token,
    spender,
    account,
  );
  const url = new URL(`/contract/${chainId}/${token}/erc20/allowance-of`, ENGINE_URL);
  url.searchParams.set("ownerWallet", account);
  url.searchParams.set("spenderWallet", spender);
  const resp = await fetch(url, { headers: baseHeaders });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const data: { result: Record<string, string> & { value: string } } = await resp.json();
  debug("Get Token Allowance Result: %s", JSON.stringify(data));
  return BigInt(data.result.value);
};

export const setMaxTokenAllowance = async (
  chainId: string | number, token: Address, spender: Address, account: Address) => {
  debug(
    "Set Max Token Allowance called: ChainID: %d | Token: %s | Spender: %s| Account: %s",
    chainId,
    token,
    spender,
    account,
  );
  const url = new URL(`/contract/${chainId}/${token}/erc20/set-allowance`, ENGINE_URL);
  const resp = await fetch(url, {
    method: "POST",
    headers: accountHeaders(account),
    body: JSON.stringify({ spenderAddress: spender, amount: formatEther(maxUint256) }),
  });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  debug("Set Max Token Allowance Result: %s", await resp.text());
};

export const getHighScoreOf = async (chainId: string | number, account: Address) => {
  debug("Get high score of called: ChainID: %d | account: %s", chainId, account);
  const url = new URL(`/contract/${chainId}/${CONTRACT}/read`, ENGINE_URL);
  url.searchParams.set("functionName", "getHighScoreOf");
  url.searchParams.set("args", account);
  const resp = await fetch(url, { headers: baseHeaders });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const data: { result: string } = await resp.json();
  return parseInt(data.result);
};

export const getHighScores = async (chainId: string | number) => {
  debug("Get high scores of called: ChainID: %d", chainId);
  const url = new URL(`/contract/${chainId}/${CONTRACT}/read`, ENGINE_URL);
  url.searchParams.set("functionName", "getHighScores");
  const resp = await fetch(url, { headers: baseHeaders });
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const data: { result: [ string[], { type: string, hex: string }[] ] } = await resp.json();
  const sorted = data.result[1]
    .map((v, i) => (
      { address: data.result[0][i] as Address, score: Number(BigInt(v.hex)) }
    ))
    .sort((a, b) => b.score - a.score)
  return Promise.all(sorted.map(async d => {
    return { ...d, name: await getEnsName(d.address) };
  }))
};
