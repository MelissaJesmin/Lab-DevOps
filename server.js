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
const places = ['Paris', 'Japan', 'Munich']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

let foodplace = []

app.get('/api/foods', (req, res) => {
    for(let i in foods) {
        foodplace.push(foods[i] + ' ' + places[i])
    }
    res.status(200).send(foodplace)
})


app.post('/api/foods', (req, res) => {
   let {name,place} = req.body
    

   const index = foodplace.findIndex(food => {
       return food === (name,place)
   })

   try {
       if (index === -1 && place !== '') {
            foodplace.push((name,place))
           res.status(200).send(foodplace)
           
       } 
       
       else if (place === ''){
           rollbar.warning(`${name} can't be blank`)
           res.status(400).send('You must enter a name.')
       } 
       else {
           rollbar.critical(`${name} already exists`)
           res.status(400).send('That food already exists.')
       }
   } catch (err) {
       rollbar.error('Cannot add food')
       console.log(err)
   }
})

app.delete('/api/foods/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    foodplace.splice(targetIndex, 1)
    res.status(200).send(foodplace)
})

const port = process.env.PORT || 4000

app.listen(port, () => console.log(`Server listening on ${port}`))

