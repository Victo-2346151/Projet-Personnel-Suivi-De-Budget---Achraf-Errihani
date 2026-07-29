import 'dotenv/config';
import cors from 'cors';
import express, { Express } from 'express';
import session from 'express-session';
import routeurAuthentification from './routes/authentification';
import routeurBonjour from './routes/bonjour';

const application: Express = express();
const port = process.env.PORT ?? 3000;

application.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
application.use(express.json());
application.use(
  session({
    secret: process.env.SESSION_SECRET ?? '',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false },
  })
);

application.use('/api', routeurBonjour);
application.use('/api', routeurAuthentification);

application.listen(port, () => {
  console.log(`Serveur demarre sur le port ${port}`);
});
