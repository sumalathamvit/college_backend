import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import schema from "./schema";
const app = express();

app.use(
  cors({
    origin: "*",
  })
);


const server = async () => {
  const apolloServer = new ApolloServer({
    schema,
    playground: process.env.NODE_ENV,
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
  });

  return app;
};

export default server;
