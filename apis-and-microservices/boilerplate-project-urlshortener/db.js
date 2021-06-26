require('dotenv').config()
const mongoose = require('mongoose')
const { Schema } = mongoose

// Connect to the database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Create the URL Schema
const URLSchema = new Schema({
  original_url: {
    type: String,
    required: String,
  },
  short_url: {
    type: Number,
    required: Number,
  },
})

// Establish the model
const URLModel = mongoose.model('URL', URLSchema)

// Export this for use in main application
module.exports = { URLModel }
