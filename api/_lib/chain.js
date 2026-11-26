// Minted check against the Nine Lives Club Candy Machine on Solana (Metaplex Core).
// Hidden settings mint sequentially: asset #N exists once itemsRedeemed >= N.
// Paste the Candy Machine address below (or set env NLC_CANDY_MACHINE in Vercel).
const RPC = process.env.SOLANA_RPC || "https://solana-rpc.publicnode.com";
const CANDY_MACHINE = process.env.NLC_CANDY_MACHINE || "";
let cache = { at: 0, ts: 0 };
async function totalSupply(fresh) {
  if (!CANDY_MACHINE) return 0;
  if (!fresh && Date.now() - cache.at < 15000) return cache.ts;
  const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getAccountInfo",
      params: [CANDY_MACHINE, { encoding: "base64", dataSlice: { offset: 104, length: 8 } }] }) });
  const j = await r.json();
  if (!j.result || !j.result.value) throw new Error("rpc");
  const ts = Number(Buffer.from(j.result.value.data[0], "base64").readBigUInt64LE(0));
  cache = { at: Date.now(), ts };
  return ts;
}
function parseId(raw) {
  const id = parseInt(String(raw || "").replace(/\.json$|\.jpg$/i, ""), 10);
  return Number.isInteger(id) && id >= 1 && id <= 777 ? id : null;
}
// minted check that never answers "not minted" from a stale cache
async function isMinted(id) {
  if (id <= (await totalSupply())) return true;
  return id <= (await totalSupply(true));
}
module.exports = { totalSupply, isMinted, parseId };
