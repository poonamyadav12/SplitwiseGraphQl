// const ActivityModel = require('../models/ActivityModel');
// const GroupInfoModel = require('../models/GroupInfoModel');
// const TransactionModel = require('../models/TransactionModel');
// const UserModel = require('../models/UserModel');
// const bcrypt = require('bcrypt');
// import Joi from 'joi';
// const { GraphQLError } = require('graphql');
// const graphql = require('graphql');
// import { updateuserschema, userschema } from '../dataschema/user_schema';
// import {
//   GraphQLObjectType,
//   GraphQLInputObjectType,
//   GraphQLString,
//   GraphQLSchema,
//   GraphQLID,
//   GraphQLInt,
//   GraphQLLong,
//   GraphQLFloat,
//   GraphQLBoolean,
//   GraphQLList,
//   GraphQLNonNull,
//   GraphQLEnumType,
// } from 'graphql';
// import { createUser } from '../services/user_service';

// var RegistrationStatus = new GraphQLEnumType({
//   name: 'RegistrationStatus',
//   values: {
//     INVITED,
//     JOINED,
//   }
// });

// const SignupType = new GraphQLObjectType({
//   name: "SignupType",
//   fields: () => ({
//     FirstName: { type: GraphQLString },
//     LastName: { type: GraphQLString },
//     Avatar: { type: GraphQLString },
//     Email: { type: GraphQLString },
//     CountryCode: { type: GraphQLString },
//     DefaultCurrency: { type: GraphQLString },
//     RegistrationStatus: { type: RegistrationStatus },
//     TimeZone: { type: GraphQLString },
//     PhoneNumber: { type: GraphQLString }
//   }),
// });


// const UserType = new GraphQLObjectType({
//   name: 'UserType',
//   fields: () => ({
//     _id: {
//       type: GraphQLString,
//     },
//     first_name: {
//       type: GraphQLString,
//     },
//     last_name: {
//       type: GraphQLString,
//     },
//     email: {
//       type: GraphQLString,
//     },
//     password: {
//       type: GraphQLString,
//     },
//     id: {
//       type: GraphQLString,
//     },
//     country_code: {
//       type: GraphQLString,
//     },
//     default_currency: {
//       type: GraphQLString,
//     },
//     registration_status: {
//       type: GraphQLString,
//     },
//     time_zone: {
//       type: GraphQLString,
//     },
//     created_at: {
//       type: GraphQLString,
//     },
//     updated_at: {
//       type: GraphQLString,
//     },
//     phone_number: {
//       type: GraphQLString,
//     },
//   }),
// });

// const GroupInfoType = new GraphQLObjectType({
//   name: 'GroupInfoType',
//   fields: () => ({
//     _id: {
//       type: GraphQLString,
//     },
//     creator: {
//       type: GraphQLString,
//     },
//     name: {
//       type: GraphQLString,
//     },
//     avatar: {
//       type: GraphQLString,
//     },
//     members: {
//       type: GraphQLList,
//     },
//     id: {
//       type: GraphQLString,
//     },
//     group_join_status: {
//       type: GraphQLString,
//     },
//     created_at: {
//       type: GraphQLString,
//     },
//     updated_at: {
//       type: GraphQLString,
//     },
//   }),
// });

// const Mutation = new GraphQLObjectType({
//   name: 'Mutation',
//   fields: {
//     createUser: {
//       type: "createUser",
//       args: {
//         FirstName: { type: GraphQLString },
//         LastName: { type: GraphQLString },
//         Avatar: { type: GraphQLString },
//         Email: { type: GraphQLString },
//         CountryCode: { type: GraphQLString },
//         DefaultCurrency: { type: GraphQLString },
//         RegistrationStatus: { type: RegistrationStatus },
//         TimeZone: { type: GraphQLString },
//         PhoneNumber: { type: GraphQLString },
//       },
//       resolve(parent, args) {
//         return createUser(args);
//       }
//     }
//   }
// });

