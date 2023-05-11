require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')

app.use(express.json())
app.use(cors())

const {ROLLBAR_ACCESS_TOKEN} = process.env
// include and initialize the rollbar library with your access token
var Rollbar = require('rollbar')
var rollbar = new Rollbar({
  accessToken: `${ROLLBAR_ACCESS_TOKEN}`,
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// record a generic message and send it to Rollbar
rollbar.log('Hello world!')

const foods = ['Pizza', 'Burger', 'Cake']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

app.get('/api/foods', (req, res) => {
    rollbar.info('someone requested the list of foods')
    res.status(200).send(foods)
})

app.post('/api/foods', (req, res) => {
   let {name} = req.body

   const index = foods.findIndex(food => {
       return food === name
   })

   try {
       if (index === -1 && name !== '') {
           foods.push(name)
           res.status(200).send(foods)
       } 
       
       else if (name === ''){
           res.status(400).send('You must enter a name.')
       } 
       else {
           res.status(400).send('That food already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/foods/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    foods.splice(targetIndex, 1)
    res.status(200).send(foods)
})

const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Server listening on ${port}`))
