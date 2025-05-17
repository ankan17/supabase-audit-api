import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './common/errorHandler';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';
import checksRoutes from './checks/checks.routes';
import chatRoutes from './chat/chat.routes';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

const app = express();

// CORS configuration with dynamic origin handling
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Parse cookies
app.use(cookieParser());

// Health check route
app.get('/', (req, res) => {
  res.send('AoK!');
});

app.use(bodyParser.json());

// Add the routes here
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/checks', checksRoutes);
app.use('/api/v1/chat', chatRoutes);

// Add the error handler after all routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
