const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// Models for manipulating data
// const { Exercise } = require('./models/exercise.js')
const { User } = require('./models/user.js')

// Connect to database
const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}) 
mongoose.set('useFindAndModify', false)

// Used to parse data as JSON from POST requests
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Creates a new Exercise object
function Exercise(description, duration, date) {
  return {
    description: String(description),
    duration: parseInt(duration),
    date: date.toDateString()
  }
}

// Create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body

  // Check if user exists, if it doesn't add user to database
  if (await User.exists({ username })) return res.send("Username already taken")

  // Return the new user's ID and username
  const createdUser = await User.create({ username })
  return res.json({
    _id: createdUser._id,
    username,
  })
})

// Add a new exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body

  // Check if ID is in right format
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.send('Invalid format for ID')

  // Check if ID exists in database
  const userExists = await User.findById(_id)
  if (!userExists) return res.send('ID not found.')

  // Make sure description is provided
  if (description.length === 0) return res.send('Description is required.')

  // Make sure duration is provided
  if (duration.length === 0) return res.send('Duration must be provided')

  // Duration must be a number > 0
  if (isNaN(duration) || parseInt(duration) <= 0)
    return res.send('Duration must be a valid number greater than 0')

  // Convert date to a date object
  let exerciseDate = date ? new Date(date) : new Date()

  const offset = exerciseDate.getTimezoneOffset() * 60000
  exerciseDate = new Date(exerciseDate.valueOf() + offset)

  // If valid, add exercise to the user
  const { username } = await User.findById(_id)

  // Update the user with a new exercise
  const exercise = Exercise(description, duration, exerciseDate)
  await User.findByIdAndUpdate(_id, { $push: { log: exercise }})

  console.log({
    _id,
    username,
    date: exerciseDate.toDateString(),
    duration: parseInt(duration),
    description,
  })

  // Return exercise as JSON
  return res.json({
    _id,
    username,
    date: exerciseDate.toDateString(),
    duration: parseInt(duration),
    description,
  })
})

// My key: 60d0c4ab5146a46f74fe0b84

// See a user's exercises
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query

  // Convert from and to to date objects
  const minDate = from == undefined ? null : new Date(from)
  const maxDate = to == undefined ? null : new Date(to)

  // Delete __v from returned user
  const user = await User.findById(_id)
  const { username } = user
  delete user.__v

  // NOTE: Rewriting this with a for loop allows for early return
  // speed gains if large number of exercise

  // Filter the log by dates
  let log = user.log.filter(exercise => {
    const date = new Date(exercise.date)

    // Too far in the past
    if (minDate != null && minDate > date) return false

    // Too far in the future
    if (maxDate != null && maxDate < date) return false

    return true
  })

  // Delete any exercises if log exceeds size of limit
  if (limit != undefined) log.length = Math.min(log.length, limit)

  // Get exercise count and username
  const count = log.length

  // Return log as json
  return res.json({ _id, username, count, log })
})

// See data for all the users
app.get('/api/users', async (req, res) => {
  // Get all users from db
  const allUsers = await User.find({}).select({ log: 0 })
  return res.json(allUsers)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
