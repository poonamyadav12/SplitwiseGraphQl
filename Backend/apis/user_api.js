var Joi = require('joi');
import { updateuserschema, userschema } from '../dataschema/user_schema.js';
import { kafka_default_response_handler, kafka_response_handler } from '../kafka/handler';
const jwt = require('jsonwebtoken');
const kafka = require("../kafka/client");
import * as userApi from '../services/user_service';

export async function createUser(req, res) {
    console.log("Inside create user post Request");
    const { error } = Joi.object().keys(
        { user: userschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    await userApi.createUser({ body: req.body },
        (err, results) =>
            kafka_response_handler(res, err, results,
                (result) => {
                    const user = result.data;
                    const payload = { _id: user._id, username: user.email };
                    const token = jwt.sign(payload, process.env.SECRET, {
                        expiresIn: 1008000
                    });
                    return res.status(result.status).send({ user, token });
                })
    );
}

export async function updateExistingUser(req, res) {
    console.log("Inside update user post Request", JSON.stringify(req.body));
    const { error } = Joi.object().keys(
        { user: updateuserschema.required(), }
    ).validate(req.body);

    if (error) {
        res.status(400).send(error.details);
        return;
    }
    await userApi.updateExistingUser(
        { path: "user-update", body: req.body },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}

export async function validateLogin(req, res) {
    console.log("Inside Login Post Request");
    const { error, value } = Joi.object().keys(
        {
            id: Joi.string().required(),
            password: Joi.string().required(),
        }
    ).validate(req.body);
    if (error) {
        res.status(400).send(error.details);
        return;
    }
    console.log("validateLogin: " + JSON.stringify(value));
    await userApi.validateLogin(
        { path: "user-login", body: req.body },
        (err, results) => kafka_response_handler(res, err, results,
            (result) => {
                console.log('login response', result)
                const user = result.data;
                console.log('user ', user);
                const payload = { _id: user._id, username: user.email };
                const token = jwt.sign(payload, process.env.SECRET, {
                    expiresIn: 1008000
                });
                return res.status(result.status).send({ user, token });
            })
    );
}

export async function getUsersBySearchString(req, res) {
    await userApi.getUsersBySearchString(
        { path: "user-search", queryString: req.query.queryString },
        (err, results) => kafka_default_response_handler(res, err, results)
    );
}
