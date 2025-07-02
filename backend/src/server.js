import express from 'express';
import { ENV } from './config/env.js';
import cors from 'cors'
import { connectDB } from './config/db.js'
import {clerkMiddleware} from '@clerk/express'
import userRoutes from './routes/user.route.js'

const app = express();
app.use(cors());
app.use(express.json());

app.use(clerkMiddleware())
app.use('/api/users', userRoutes)

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