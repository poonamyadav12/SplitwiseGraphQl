import { SERVER_URL, userConstants } from '../_constants';
import { alertActions, viewActions } from './';
import axios from 'axios';
import cookie from 'react-cookies';
import { history } from '../_helper/history.js';
import { graphql, Query, withApollo } from 'react-apollo';
import { client } from '../index';
import { createUser, loginUser, updateUser } from '../graphql/mutation';

export const userActions = {
    login,
    logout,
    register,
    update,
};

function login(username, password) {
    console.log("Login Action ");
    return async dispatch => {
        dispatch(request({ username }));
        const data = {
            id: username,
            password: password
        }
        //set the with credentials to true
        axios.defaults.withCredentials = true;
        //make a post request with the user data
        try {
            const response = await client.mutate({ mutation: loginUser, variables: data });
            console.log("Login Action 1 ", response);

            if (response.data.login.error) {
                dispatch(failure("Login failed"));
                dispatch(alertActions.error(response.data.login.error));
            } else {
                dispatch(success(response.data.login));
            }
            history.push('/login');
        }
        catch (error) {
            console.log("Login Action 2 ", error);
            let msg = ["Some error occured, please try again."];
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(data) {
        return { type: userConstants.LOGIN_SUCCESS, data }
    }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    cookie.remove('cookie', { path: '/' });
    return dispatch => {
        dispatch({ type: userConstants.LOGOUT });
        dispatch(viewActions.setDashboardView());
    };
}

function register(data) {
    return async dispatch => {
        dispatch(request(data));
        try {
            const response = await client.mutate({ mutation: createUser, variables: data.user });
            console.log("response ", response);
            if (response.data.signup.error) {
                dispatch(failure("Registration failed"));
                dispatch(alertActions.error(response.data.signup.error));
            } else {
                dispatch(success(response.data.signup));
            }
            history.push('/signup');
        } catch (error) {
            console.log("error in signup " + JSON.stringify(error));
            const msg = ["Some error occured, please try again."];
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }
    };

    function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
    function success(data) { return { type: userConstants.REGISTER_SUCCESS, data } }
    function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
}

function update(data) {
    return async dispatch => {
        dispatch(request(data));
        try {
            const response = await client.mutate({ mutation: updateUser, variables: data.user });
            console.log("response ", response);
            if (response.data.updateUser.error) {
                dispatch(failure("Update User failed"));
                dispatch(alertActions.error(response.data.updateUser.error));
            } else {
                dispatch(success(response.data.updateUser.user));
                dispatch(alertActions.success("Updated successfully"));
            }
        } catch (error) {
            let msg = ["Some error occured, please try again."];
            dispatch(failure(msg));
            dispatch(alertActions.error(msg));
        }

    };

    function request(user) { return { type: userConstants.UPDATE_REQUEST, user } }
    function success(user) { return { type: userConstants.UPDATE_SUCCESS, user } }
    function failure(error) { return { type: userConstants.UPDATE_FAILURE, error } }
}
