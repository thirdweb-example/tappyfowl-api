import { Router } from "express";
import { AUTH_KEY, NFT, TOKEN } from "../util/constants";
import { buyCharacter, getERC1155Balance, getERC20Balance, sendResult } from "../util/engine";
import { GAME_CLIENT_UNAUTHORIZED, sendError } from "../util/responses";

const router = Router();

router.get("/:chainId/:address/balances", async (req, res) => {
  const address = req.params.address as `0x${string}`;
  try {
    const [ token, nft ] = await Promise.all([
      getERC20Balance(req.params.chainId, TOKEN, address),
      getERC1155Balance(req.params.chainId, NFT, address),
    ]);
    res.json({ status: "success", token: token, nft: nft });
  } catch (e: any) {
    return sendError(res, 400, e);
  }
});

router.post("/:chainId/result", async (req, res) => {
  if (req.headers.authorization !== AUTH_KEY) {
    return sendError(res, 401, GAME_CLIENT_UNAUTHORIZED);
  }
  try {
    await sendResult(req.params.chainId, TOKEN, req.body);
    res.json({ status: "success" });
  } catch (e: any) {
    return sendError(res, 400, e);
  }
});

router.post("/:chainId/purchase", async (req, res) => {
  if (req.headers.authorization !== AUTH_KEY) {
    return sendError(res, 401, GAME_CLIENT_UNAUTHORIZED);
  }
  try {
    await buyCharacter(req.params.chainId, TOKEN, req.body);
    res.json({ status: "success" });
  } catch (e: any) {
    return sendError(res, 400, e);
  }
});

export { router };
