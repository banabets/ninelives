const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { isMinted, parseId } = require("../_lib/chain");
module.exports = async (req, res) => {
  const id = parseId(req.query.id);
  if (!id) return res.status(404).end();
  let minted = false;
  try { minted = await isMinted(id); } catch (e) { return res.status(503).end(); }
  if (!minted) { res.setHeader("Cache-Control", "no-store, max-age=0"); res.setHeader("Location", "/nft/sealed.jpg"); return res.status(302).end(); }
  const keyB64 = process.env.NFT_VAULT_KEY;
  if (!keyB64) return res.status(500).send("vault key missing");
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "_vault", `${id}.bin`));
    const d = crypto.createDecipheriv("aes-256-gcm", Buffer.from(keyB64, "base64"), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    const img = Buffer.concat([d.update(buf.subarray(28)), d.final()]);
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(img);
  } catch (e) { res.status(404).end(); }
};
