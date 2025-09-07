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
    // Get parameters from query string
    const { 
      searchTerm = "The Oscars", 
      timeframe = "7d", 
      language = "en-US", 
      country = "US" 
    } = req.query;

    // Map language to country code for ceid
    const countryCode = country.toUpperCase();
    const languageCode = language.toLowerCase();
    const ceid = `${countryCode}:${languageCode.split('-')[0]}`;

    let timer = 0;
    const interval = setInterval(() => {
      timer++
    }, 1);
    
    const articles = await googleNewsScraper({
      searchTerm: searchTerm,
      prettyURLs: true,
      getArticleContent: false, 
      queryVars: {
        hl: language,
        gl: countryCode,
        ceid: ceid
      },
      timeframe: timeframe,
      puppeteerArgs: [
        "--no-sandbox", 
        "--disable-setuid-sandbox"
      ], 
      useLambdaLayer: true, 
    });
    
    clearInterval(interval);
    res.status(200).json({
      articles, 
      timer,
      searchTerm,
      timeframe,
      language,
      country
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: err.message || err});
  }
};