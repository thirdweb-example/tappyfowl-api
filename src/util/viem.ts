import Debug from "debug";
import { type Address, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { cache } from "./cache";
import { RPC_URL } from "./constants";

const debug = Debug("tappyfowl-api:server");

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL)
})

export const getEnsName = async (address: Address): Promise<string> => {
  const key = `ens-${address}`
  if (cache.hasItem(key)) {
    return cache.retrieveItemValue(key) as string;
  }
  try {
    const name = await client.getEnsName({ address })
    if (name !== null) {
      cache.storeExpiringItem(key, name, 86_400)
      return name;
    }
  } catch (e: any) {
    debug("getEnsName error: %s", String(e));
  }

  return address;
}
