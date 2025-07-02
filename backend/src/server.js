import express from 'express';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js'
const app = express();

app.get("/", (req, res) => {
    res.send('Hello from server')
})

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log(`Server is running on port ${ENV.PORT}`);
        })
    } catch (err) {
        console.log('error in starting server', err);
        process.exit(1)
    }
}

startServer()