// Minted check against the Nine Lives Club contract on Robinhood Chain (ids are sequential from 1).
const RPC = "https://rpc.mainnet.chain.robinhood.com";
const NFT = "0x36D7eb4495Faa4a7f3D725A1F458B967b01bc83a";
let cache = { at: 0, ts: 0 };
async function totalSupply() {
  if (Date.now() - cache.at < 15000) return cache.ts;
  const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: NFT, data: "0x18160ddd" }, "latest"] }) });
  const j = await r.json();
  if (!j.result) throw new Error("rpc");
  cache = { at: Date.now(), ts: parseInt(j.result, 16) };
  return cache.ts;
}
function parseId(raw) {
  const id = parseInt(String(raw || "").replace(/\.json$|\.jpg$/i, ""), 10);
  return Number.isInteger(id) && id >= 1 && id <= 777 ? id : null;
}
module.exports = { totalSupply, parseId };
