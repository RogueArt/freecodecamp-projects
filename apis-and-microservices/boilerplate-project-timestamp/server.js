// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
require('dotenv').config()

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

function isInteger(num) {
  return /^\d+$/.test(num)
}

function isValidDateStr(dateStr) {
  return new Date(dateStr).toString() !== 'Invalid Date'
}

// Timestamp microservice
app.get("/api/:date?", (req, res) => {
  // Received no parameters -> send current time
  if (req.params.date == undefined) {
    const date = new Date();
    return res.json({ 
      unix: date.getTime(),
      utc: date.toString(),
    }) 
  }

  let { date } = req.params

  console.log(isValidDateStr(date))

  // Check if it's a Unix timestamp, if so set date to it
  if (isInteger(date)) date = new Date(parseInt(date))
  
  // Otherwise assume it's a YYYY-MM-DD string
  else if (isValidDateStr(date)) date = new Date(date)
  
  // Otherwise assume it's invalid
  else return res.json({ error: 'Invalid Date' })

  // Return the date
  return res.json({
    unix: date.getTime(),
    utc: date.toGMTString(),
  })
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
