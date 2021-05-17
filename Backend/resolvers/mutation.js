import dotenv from 'dotenv';
import * as groupApi from '../services/group_service';
import * as userApi from '../services/user_service';
import * as transactionApi from '../services/transactions_service';
const jwt = require('jsonwebtoken');
dotenv.config();

export const Mutation = {
  signup: userApi.createUser,
  login: userApi.login,
  updateUser: userApi.updateExistingUser,
  createGroup: groupApi.createGroup,
  updateGroup: groupApi.updateGroup,
  joinGroup: groupApi.joinGroup,
  leaveGroup: groupApi.leaveGroup,
  createTransaction: transactionApi.createTransaction,
  updateTransaction: transactionApi.updateTransactions,
  settleUpTransaction: transactionApi.settleTransactions,
  addComment: transactionApi.addComment,
  deleteComment: transactionApi.deleteComment,
};
