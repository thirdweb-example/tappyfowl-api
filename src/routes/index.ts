import { Router } from "express";
import { getAddress } from "viem";
import { AUTH_KEY, NFT, TOKEN } from "../util/constants";
import {
  buyCharacter,
  getERC1155Balance,
  getERC20Balance,
  getHighScoreOf,
  getHighScores,
  sendResult,
} from "../util/engine";
import { GAME_CLIENT_UNAUTHORIZED, sendError } from "../util/responses";
import { getEnsName } from "../util/viem";

const router = Router();

router.get("/:chainId/:address/balances", async (req, res) => {
  try {
    const address = getAddress(req.params.address);
    const [ tokens, character0, name ] = await Promise.all([
      getERC20Balance(req.params.chainId, TOKEN, address),
      getERC1155Balance(req.params.chainId, NFT, address),
      getEnsName(address)
    ]);
    res.json({ status: "success", tokens, characters: [Number(character0)], name });
  } catch (e: any) {
    return sendError(res, 400, e);
  }
});

router.get("/:chainId/:address/high-score", async (req, res) => {
  try {
    const address = getAddress(req.params.address);
    const highScore = await getHighScoreOf(req.params.chainId, address);
    res.json({ status: "success", result: highScore });
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
    await buyCharacter(req.params.chainId,  TOKEN, NFT, req.body);
    res.json({ status: "success" });
  } catch (e: any) {
    return sendError(res, 400, e);
  }
});

export { router };
