import express, { Application, Request, Response } from 'express';

const app: Application = express();

// RootAPI
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to FixItNow Server!');
});

export default app;
