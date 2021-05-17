//import the require dependencies
import { json, urlencoded } from 'body-parser';
//var cookieParser = require('cookie-parser');
import { join } from 'path';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { getActivities, getActivitiesV2 } from './apis/activity_api';
import { createGroup, getAllGroupsForUser, getGroupDetails, joinGroup, leaveGroup, updateGroup } from './apis/group_api';
import { uploadImage } from './apis/image_upload';
import { addComment, createTransaction, deleteComment, getAllTransactionsForFriend, getAllTransactionsForGroup, getAllTransactionsForUser, settleTransactions, updateTransactions } from './apis/transactions_api';
import { createUser, getUsersBySearchString, updateExistingUser, validateLogin } from './apis/user_api';
import { UserType2 } from './schema/schema';
const { auth } = require("./utils/passport");
const passport = require('passport');
const { graphqlHTTP } = require('express-graphql');
import { buildSchema, printSchema } from 'graphql';
import { resolvers } from './resolvers';
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
import { addResolversToSchema } from '@graphql-tools/schema';
const { loadSchemaSync } = require('@graphql-tools/load');


var cookieParser = require('cookie-parser')
var app = express();

app.use(cookieParser());

app.set('view engine', 'ejs');

//use cors to allow cross origin resource sharing
app.use(cors({ origin: `${process.env.CLIENT_URL}:3000`, credentials: true }));

console.log('Schema Path ', join(__dirname, './schema/schema.graphql'));
const schema = loadSchemaSync(join(__dirname, './schema/schema.graphql'), {
    loaders: [
        new GraphQLFileLoader()
    ]
});

// console.log('Schema ', printSchema(schema));

const schemaWithResolvers = addResolversToSchema({
    schema,
    resolvers,
});

app.use("/graphql", graphqlHTTP({
    schema: schemaWithResolvers,
    graphiql: true
}));

//use express session to maintain session data
app.use(session({
    secret: 'cmpe273_kafka_passport_mongo',
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration: 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration: 5 * 60 * 1000
}));

// Passport middleware
app.use(passport.initialize());
auth();

const mongoDB = require('./database/config');
const mongoose = require('mongoose');

console.log("mongoDb " + JSON.stringify(mongoDB.config.mongoDB));

// load app middlewares
app.use(json());
app.use(urlencoded({ extended: false }));

//Allow Access Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', `${process.env.CLIENT_URL}:3000`);
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 500,
    bufferMaxEntries: 0
};

mongoose.connect(mongoDB.config.mongoDB, options, (err, res) => {
    if (err) {
        console.log(err);
        console.log(`MongoDB Connection Failed`);
    } else {
        console.log(`MongoDB Connected`);

    }
});


//Route to handle CreateUser Post Request Call Done
app.post('/user/signup', createUser);

//Route to handle CreateUser Post Request Call Done
app.put('/user/update', updateExistingUser);

//Route to handle Login get Request Call Done
app.post('/user/login', validateLogin);

//Route to handle create group Request Call Done
app.post('/group/create', createGroup);

//Route to handle update group Request Call Done
app.post('/group/update', updateGroup);

//Route to handle leave group Request Call Done
app.post('/group/leave', leaveGroup);

//Route to handle join group Request Call Done
app.post('/group/join', joinGroup);

//Route to handle get group Request Call Done
app.get('/group/get', getGroupDetails);

//Route to handle get group Request Call Done
app.get('/group/transactions', getAllTransactionsForGroup);

//Route to handle get group Request Call Done
app.get('/user/groups', getAllGroupsForUser);

//Route to handle search User Done
app.get('/user/search', getUsersBySearchString);

//Route to handle create txn Request Call Done
app.post('/transaction/create', createTransaction);

//Route to handle update txn Request Call Done
app.post('/transaction/update', updateTransactions);

//Route to handle settle transation Done
app.post('/transactions/settle', settleTransactions);

//Done
app.get('/transaction/friend', getAllTransactionsForFriend);

app.get('/user/activity', getActivities);

app.get('/user/activityv2', getActivitiesV2);

app.post('/image-upload', uploadImage);

// Done
app.get('/user/transactions', getAllTransactionsForUser);

app.post('/transaction/comment', addComment);

app.post('/transaction/comment/delete', deleteComment);

//Route to handle get group Request Call
//app.get('/groups/transactions', );

//start your server on port 3001
//app.listen(3001);
app.listen(3004, () => {
    console.log('GraphQL server started on port 3004');
});

console.log("Server Listening on port 3001");

export default app;