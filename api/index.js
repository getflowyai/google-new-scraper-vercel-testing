const googleNewsScraper = require("../gns");

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let timer = 0;
    const interval = setInterval(() => {
      timer++
    }, 1);
    
    const articles = await googleNewsScraper({
      searchTerm: "The Oscars",
      prettyURLs: true,
      getArticleContent: false, 
      queryVars: {
        hl:"en-US",
        gl:"US",
        ceid:"US:en"
      },
      timeframe: "5d",
      puppeteerArgs: [
        "--no-sandbox", 
        "--disable-setuid-sandbox"
      ], 
      useLambdaLayer: true, 
    });
    
    clearInterval(interval);
    res.status(200).json({
      articles, 
      timer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message || err});
  }
};