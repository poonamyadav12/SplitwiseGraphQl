const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
import { SignupStatus, updateuserschema, userschema } from '../dataschema/user_schema';
import { createJoiError, createSingleError } from '../helper/error';
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

export async function createUser(parent, args) {
    console.log('Inside signup resolver ');

    let user = args.user;
    const { value, error } = userschema.validate(user);
    if (error) {
        return createJoiError(error);
    }

    user = value;
    try {
        const storedUser = await getUserById(user.email);

        if (storedUser && isUserInvited(storedUser)) {
            user = await updateUser(user);
        } else {
            user = await insertUser(user);
        }
    } catch (error) {
        console.log('coming here', error);
        if (error.code == '11000') {
            return createSingleError('User Id Already Exists.');
        }
        return createSingleError(
            'Unable to create user. Please check application logs for more detail.'
        );
    }

    user = user.toObject();
    const payload = { _id: user._id, username: user.email };
    const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: 1008000,
    });
    return { __typename: 'SignupSuccess', user, token };
}

export async function updateExistingUser(parent, args) {
    let user = args.user;
    const { value, error } = updateuserschema.validate(user);
    if (error) {
        return createJoiError(error);
    }

    user = value;
    console.log("Inside updateExisting User", user);
    try {
        const storedUser = await getUserById(user.email);

        if (!storedUser) {
            return createSingleError('Invalid User ID.');
        }

        if (user.new_password) {
            const passwordMatch = await matchPassword(user.password, storedUser.password);
            if (!passwordMatch) {
                return createSingleError('Invalid Password');
            }
            user.password = await hashPassword(user.new_password);
            delete user.new_password;
        } else {
            console.log("Stored pass" + storedUser.password);
            console.log("current pass" + user.password);
            if (storedUser.password !== user.password) {
                return createSingleError('Invalid Existing Password');
            }
        }
        console.log("Going inside update user ", user);
        user = (await updateUser(user)).toObject();
    } catch (error) {
        return createSingleError('Unable to successfully update the user!');
    }
    return { __typename: 'UpdateUserSuccess', user };
}

export async function login(parent, args) {
    const { id, password } = args;
    console.log("id", id, "pass ", password);
    try {
        let user = await getUserById(id);
        if (!user) {
            return createSingleError('Invalid user ID.');
        }

        user = user.toObject();
        const passwordMatch = await matchPassword(password, user && user.password || '');
        if (!passwordMatch) {
            return createSingleError('UserId and password does not match.');
        }
        const payload = { _id: user._id, username: user.email };
        const token = jwt.sign(payload, process.env.SECRET, {
            expiresIn: 1008000
        });
        return { __typename: 'LoginSuccess', user, token };
    } catch (error) {
        console.log("Error ", error);
        return createSingleError('Unable to validate the credentials.');
    }
}

export async function insertUser(user) {
    console.log("Inside insert User");
    if (user.password) {
        user.password = await hashPassword(user.password);
    }
    var user = new UserModel(user);
    return await user.save();
}

export async function updateUser(user) {
    console.log("Inside update user");
    const value = await UserModel.findOneAndUpdate(
        { email: user.email },
        { ...user },
        { new: true }
    );
    await value.save();
    return value;
}

export async function insertIfNotExist(user) {
    console.log("User id " + JSON.stringify(user));
    const id = user.email;
    const storedUser = await getUserById(id);
    if (storedUser) {
        return;
    }
    await insertUser(user);
}

export async function getUserByEmailId(message, callback) {
    let response = {};
    let error = {};
    console.log("Inside get user by Email ID");
    try {
        const user = await UserModel.findOne({ email: message });
        console.log("user response  ", JSON.stringify(user));
        response.status = 200;
        response.data = user;
        return callback(null, response);
    }
    catch (err) {
        console.log(err);
        error.code = 500;
        error.data = { code: err.code, msg: 'Unable to get the user by Email Id.' };
        return callback(error, null);
    }
}

export async function getUserById(userId) {
    console.log("Inside get user by Id", userId);
    const user = await UserModel.findOne({ email: userId });
    console.log("user response  ", JSON.stringify(user));
    return user;
}

export function isUserInvited(user) {
    //console.log("isUserInvited: " + JSON.parse(user).registration_status);
    return (user.registration_status === SignupStatus.INVITED);
}

export async function getUsersBySearchString(parent, args) {
    let searchString = args.queryString;
    console.log("Search String " + searchString);
    let limit = args.limit;
    try {
        const users = await searchUsers(searchString, limit);
        return { __typename: 'UserList', users }
    } catch (error) {
        console.log(error);
        return createSingleError('Unable to successfully get the search result!');
    }
}

async function searchUsers(searchString = "", limit = 20) {
    console.log("Search string " + searchString);
    const query = { $text: { $search: searchString } };
    const result = await UserModel.find(query).limit(Number(limit));
    console.log(result);
    if (result.length > 0) {
        return result;
    }
    return [];
}

async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })
    return hashedPassword;
}

export async function matchPassword(newPassword, storedEncryptedPassword) { // updated
    console.log("Inside match password");
    console.log("passw1" + newPassword + " password2 " + storedEncryptedPassword);
    const isSame = await bcrypt.compare(newPassword, storedEncryptedPassword) // updated
    console.log(isSame) // updated
    return isSame;

}
