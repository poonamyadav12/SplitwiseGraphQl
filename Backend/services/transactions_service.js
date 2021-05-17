import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '../dataschema/activity_schema.js';
import { createSingleError } from '../helper/error.js';
import { insertActivity } from './activity_service.js';
const TransactionModel = require('../models/TransactionModel');
const UserModel = require('../models/UserModel');
var Joi = require('joi');

const commonTransactionAggregationSteps = [
    {
        $lookup: {
            from: "users",
            localField: "comments.userId",
            foreignField: "email",
            as: "commentUsers"
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'from',
            foreignField: 'email',
            as: 'from',
        },
    },
    {
        $lookup: {
            from: 'users',
            localField: 'to',
            foreignField: 'email',
            as: 'to',
        },
    }, {
        $lookup: {
            from: 'groupinfos',
            localField: 'group_id',
            foreignField: 'id',
            as: 'group',
        },
    },
];

const commonFieldsMapping = {
    createdAt: '$created_at',
    updatedAt: '$updated_at',
    from: { $arrayElemAt: ['$from', 0] },
    group: { $arrayElemAt: ['$group', 0] },
    comments: {
        $map: {
            input: "$comments",
            as: "cm",
            in: {
                $mergeObjects: [
                    "$$cm",
                    {
                        "user": {
                            $first: {
                                $filter: {
                                    input: "$commentUsers",
                                    cond: { $eq: ["$$this.email", "$$cm.userId"] }
                                }
                            }
                        }
                    }
                ]
            },
        },
    }
};

export async function createTransaction(parent, args) {
    const transaction = args.transaction;
    try {
        const modifiedTxn = JSON.parse(JSON.stringify(transaction));
        modifiedTxn.id = uuidv4();
        //Mongo Db model to save transaction
        var transactionModel = new TransactionModel(modifiedTxn);
        await transactionModel.save();
        const transactionActivity = buiildTransactionActivity(
            modifiedTxn.from,
            modifiedTxn.group_id,
            modifiedTxn
        );
        insertActivity(transactionActivity);
        return { __typename: "Success", success: "Successfully created txns" };
    } catch (err) {
        console.log(err);
        return createSingleError('Unable to successfully insert the txn!');
    }
}

export async function updateTransactions(parent, args) {
    console.log('Inside update txn post Request');
    const transaction = args.transaction;
    try {
        const value = await TransactionModel.findOneAndUpdate(
            { id: transaction.id },
            { ...transaction },
            { new: true }
        );
        await value.save();
        return { __typename: "Success", success: "Successfully created txns" }
    } catch (err) {
        console.log(err);
        return createSingleError('Unable to successfully update the txn!');
    }
}

export async function addComment(parent, args) {
    console.log('Inside update txn post Request');
    const comment = args.body;
    try {
        const value = await TransactionModel.findOneAndUpdate(
            { id: comment.txnId },
            { $push: { comments: comment } },
            { new: true }
        );
        await value.save();
        const txns = await getTransactionsByTxnId(comment.txnId);
        return { __typename: "Transaction", ...JSON.parse(JSON.stringify(txns)) }
    } catch (err) {
        console.log(err);
        return createSingleError('Unable to successfully update the txn!')
    }
}

export async function deleteComment(parent, args) {
    console.log('Inside delete comment post Request');
    const _id = args._id;
    try {
        await TransactionModel.updateMany({}, { $pull: { "comments": { "_id": _id } } }, { multi: true });
        return { __typename: "Success", success: "Deleted successfully" };
    } catch (err) {
        return createSingleError("Unable to delete the comment, please try again");
    }
}

export async function settleTransactions(parent, args) {
    console.log('Inside settle txn post Request');
    const transactions = args.transactions;
    try {
        const modifiedTxns = transactions.map((txn) => {
            txn.id = uuidv4();
            return txn;
        });
        //Mongo db
        await Promise.all(
            modifiedTxns.map(async (txn) => {
                var transactionModel = new TransactionModel(txn);
                await transactionModel.save();
            })
        );
        modifiedTxns.map((modifiedTxn) => {
            const transactionActivity = buiildTransactionActivity(
                modifiedTxn.from,
                modifiedTxn.group_id,
                modifiedTxn
            );
            insertActivity(transactionActivity);
        });
        return { __typename: "Success", success: "Successfully created txns" };
    } catch (err) {
        console.log(err);
        return createSingleError('Unable to successfully insert the txn! ');
    }
}

function buiildTransactionActivity(creator, groupId, transaction) {
    return JSON.parse(
        JSON.stringify({
            user_id: creator,
            group: {
                id: groupId,
            },
            transaction: transaction,
            type: ActivityType.TRANSACTION_ADDED,
        })
    );
}

export async function getAllTransactionsForGroup(parent, args) {
    let groupId = args.groupId;
    console.log('Inside get all transactions for group Request');

    try {
        const transactions = await getTransactionsByGroupId(groupId);
        console.log("transactions ", JSON.stringify(transactions));
        return { __typename: "TransactionList", transactions: JSON.parse(JSON.stringify(transactions)) };
    } catch (err) {
        console.log("Error ", err);
        return createSingleError("Transactions fetch failed");
    }
}

export async function getTransactionsByGroupId(groupId) {
    console.log('Group idX ', groupId);
    const transactions = await TransactionModel.aggregate([
        {
            $match: { group_id: groupId },
        },
        ...commonTransactionAggregationSteps,
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: commonFieldsMapping,
        },
    ]);
    return transactions;
}

export async function getTransactionsByTxnId(txnId) {
    console.log('TxnId idX ', txnId);
    const transactions = await TransactionModel.aggregate([
        {
            $match: { id: txnId },
        },
        ...commonTransactionAggregationSteps,
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: commonFieldsMapping,
        },
    ]);
    return transactions[0];
}

export async function getAllTransactionsForFriend(parent, args) {
    // Access the provided 'page' and 'limt' query parameters

    let friendId = args.friendId;
    let userId = args.userId;

    console.log('Inside get friend Transaction Request');

    try {
        const transactions = await getTransactionsByFriendId(friendId, userId);
        console.log('Transactions By friend ID  ' + JSON.stringify(transactions));
        return { __typename: "TransactionList", transactions: JSON.parse(JSON.stringify(transactions)) };
    } catch (err) {
        console.log(err);
        return createSingleError('Unable to successfully get the Friend Transaction!');
    }
}
export async function getAllTransactionsForUser(parent, args) {
    // Access the provided 'page' and 'limt' query parameters
    let userId = args.userId;
    console.log('Inside get User Transaction Request');

    try {
        const transactions = await getTransactionsByUserId(userId);
        console.log('Transactions By User ID  ' + JSON.stringify(transactions));
        return { __typename: "TransactionList", transactions: JSON.parse(JSON.stringify(transactions)) }
    } catch (err) {
        console.log(err);
        return createSingleError('Unable to successfully get the User Transaction! ');
    }
}

export async function getTransactionsByFriendId(friendId, userId) {
    console.log('friend id ', friendId);
    console.log('user id ', userId);
    const transaction = await TransactionModel.aggregate([
        {
            $match: {
                $or: [
                    {
                        $and: [{ from: userId }, { to: friendId }],
                    },
                    {
                        $and: [{ from: friendId }, { to: userId }],
                    },
                ],
            },
        },
        ...commonTransactionAggregationSteps,
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: commonFieldsMapping,
        },
    ]);

    console.log('transaction response ', transaction);

    return transaction;
}

async function getTransactionsByUserId(userId) {
    const transactions = await TransactionModel.aggregate([
        {
            $match: {
                $or: [{ from: userId }, { to: userId }],
            },
        },
        ...commonTransactionAggregationSteps,
        {
            $sort: { created_at: -1 },
        },
        {
            $addFields: { ...commonFieldsMapping, group: { $arrayElemAt: ['$group', 0] }, }
        },

    ]);

    return transactions;
}