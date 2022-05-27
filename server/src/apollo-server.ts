import * as express from "express"

import { Server } from "http"

import Db from "./db"

import { ApolloServer, ExpressContext } from "apollo-server-express"
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core"

import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader"
import { loadSchemaSync } from "@graphql-tools/load"
import { addResolversToSchema } from "@graphql-tools/schema"
import { GRAPHQL_SCHEMA_PATH } from "./constants"
import resolvers, { TwitterResolverContext } from "./resolvers"

const SCHEMA = loadSchemaSync(GRAPHQL_SCHEMA_PATH, {
  loaders: [new GraphQLFileLoader()],
})

export async function createApolloServer(
  db: Db,
  app: express.Application,
  httpServer: Server
): Promise<ApolloServer<ExpressContext>> {
  const server = new ApolloServer({
    schema: addResolversToSchema({
      schema: SCHEMA,
      resolvers,
    }),
    context: (): TwitterResolverContext => ({ db }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  })

  await server.start()

  server.applyMiddleware({ app })

  return server
}
