const express = require('express')

const cors = require('cors')

require('dotenv').config({
  path
    : __dirname + '/../.env'
})


const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const productRouter = require('./routes/product')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')
const checkoutRouter = require('./routes/checkout')
const {
  handleMalformedJson,
  formatCelebrateErrors
} = require('./middlewares/handleError')
const connectDB = require('../config/db')

const app = express()

app.use(cors())
app.use(express.json())
app.use(handleMalformedJson)


app.use("/auth", authRouter)
app.use("/users", userRouter)
app.use("/products", productRouter)
app.use("/carts", cartRouter)
app.use("/orders", orderRouter)
app.use("/checkout", checkoutRouter)

app.get("/", (req, res) => {
  res.json({ status: "ok" })
})

app.use(formatCelebrateErrors)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
  connectDB()
})