const mongoose = require('mongoose')
require('dotenv').config()


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("MongoDB connected successfully");
    } catch (error) {
        return console.error("MongoDB connection failed:", error.message);
    }
}


module.exports = connectDB