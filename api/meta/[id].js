const { isMinted, parseId } = require("../_lib/chain");
const SITE = "https://www.ninelives.click";
const DESC = "Nine Lives Club: one-of-one black cats from nine worlds, on Robinhood Chain. Part of a cartoon show: episodes on YouTube @ninelivesontv.";
module.exports = async (req, res) => {
  const id = parseId(req.query.id);
  if (!id) return res.status(404).json({ error: "not found" });
  let minted = false;
  try { minted = await isMinted(id); } catch (e) { res.setHeader("Cache-Control", "no-store"); return res.status(503).json({ error: "chain unavailable" }); }
  if (!minted) {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    return res.status(200).json({ name: `Nine Lives #${id}`, description: DESC + " Not minted yet.", image: `${SITE}/nft/sealed.jpg`, attributes: [{ trait_type: "Status", value: "Sealed" }] });
  }
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  res.status(200).json({ name: `Nine Lives #${id}`, description: DESC, image: `${SITE}/api/img/${id}.jpg`, external_url: SITE,
    attributes: [{ trait_type: "Edition", value: "1 of 1" }, { trait_type: "Phase", value: id <= 128 ? 1 : 2 }] });
};
