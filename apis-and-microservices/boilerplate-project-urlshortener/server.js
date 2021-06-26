require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const { URLModel } = require('./db.js')

// Use this for seeing if a link exists
const dns = require('dns')
const url = require('url')

// Parse the body to get data from a POST request
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

function hasOnlyNumbers(str) {
  return /^\d+$/.test(str)
}

// Send back the shortened URL
app.get('/api/shorturl/:num', async (req, res) => {
  const { num } = req.params

  // Wrong format if it's a string or less than 1
  if (!hasOnlyNumbers(num) || parseInt(num) < 1) {
    return res.json({ error: 'Wrong format' })
  }

  // Give an error if it couldn't find the URL
  const redirectURL = await URLModel.findOne({ short_url: num })
  if (redirectURL == null) return res.json({ error: 'No short URL found for the given input' })

  // Redirect to the shortened URL
  res.redirect(redirectURL.original_url)
});

// Add a shortened URL
// Note: This will treat https://www.google.com and https://www.google.com/ as
// different URLs as URLs can include paths to pages
app.post('/api/shorturl', (req, res) => {
  // Get host - No http/https
  const { url: original_url } = req.body
  const { host } = url.parse(original_url)

  // URL is not valid, return invalid
  if (host == null) return res.json({ error: 'Invalid URL' })

  // Check if the URL is valid
  dns.lookup(host, null, async (err, address, family) => {
    // If failed DNS lookup, invalid
    if (err) return res.json({ error: 'Invalid URL' })

    // Assuming URL is valid, check if it exists in DB
    // If it does, return the already existing url
    if (await URLModel.exists({ original_url })) {
      const savedURL = await URLModel.findOne({ original_url })

      return res.json({
        original_url: savedURL.original_url,
        short_url: savedURL.short_url,
      })
    }

    // Number for the URL is 1 greater than number of documents in db
    const URLNumber = (await URLModel.estimatedDocumentCount({})) + 1

    // Otherwise URL is valid, add it to database
    const newURL = {
      original_url: original_url,
      short_url: URLNumber,
    }
    const URL = new URLModel(newURL)
    await URLModel.create(URL)

    // Return the JSON
    return res.json(newURL)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
