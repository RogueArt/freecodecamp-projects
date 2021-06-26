const express = require('express');
const cors = require('cors');
require('dotenv').config()

var app = express();

// Middleware for getting data about text file
const multer = require('multer')
const upload = multer()

app.use(express.json({ extended: true }))

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// File analysis endpoint
// Upload single as we only expect one file (upfile) to be uploaded
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const { file } = req

  // Make sure file was uploaded
  if (file == undefined) return res.json({ error: 'No file uploaded' })

  // Return JSON with all the data
  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size
  })
})

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
