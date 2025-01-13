const shortid = require("shortid");
const URL = require("../models/url");
async function handleGenerateNewShortUrl(req, res) {
  const body = req.body;
  try {
    if (!body.url)
      return res.status(400).json({ error: "Please provide a URL" });
    const shortID = shortid();
    await URL.create({
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [],
      createdBy: req.user._id,
    });
    return res.json({ id: shortID });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = {
  handleGenerateNewShortUrl,
  handleGetAnalytics,
};
