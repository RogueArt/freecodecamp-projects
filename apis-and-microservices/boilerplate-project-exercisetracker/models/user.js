const mongoose = require('mongoose')
const { Schema } = mongoose

// Create Exercise schema
const ExerciseSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: String,
}, { _id: false })

// Create the user model which has an array of exercises
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  log: [ ExerciseSchema ]
})

const User = mongoose.model('User', UserSchema)

module.exports = { User }