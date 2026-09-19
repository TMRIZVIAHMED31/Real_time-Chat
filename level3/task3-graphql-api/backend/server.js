require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { json } = require("body-parser");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const connectDB = require("./config/db");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const buildContext = require("./graphql/context");

async function startServer() {
  await connectDB();

  const app = express();

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();

  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(apolloServer, { context: buildContext })
  );

  app.get("/", (req, res) => {
    res.send("Codveda Level 3 Task 3 - GraphQL API. Open /graphql for the sandbox.");
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`GraphQL server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
