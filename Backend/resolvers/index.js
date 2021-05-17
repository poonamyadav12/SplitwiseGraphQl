import { GraphQLScalarType } from 'graphql';
import { Mutation } from './mutation';
import { Query } from './query';

export const resolvers = {
  Mutation,
  Query,
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      console.log("ValueZ ", value);
      return new Date(value); // value from the client
    },
    serialize(value) {
      console.log("ValueY ", new Date(value));
      return new Date(value); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  })
}