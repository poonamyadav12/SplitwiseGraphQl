import { v4 as uuidv4 } from 'uuid';
import { ActivityType } from '../dataschema/activity_schema.js';
import { creategroupschema, updategroupschema } from '../dataschema/group_schema.js';
import { GroupJoinStatus } from '../dataschema/user_schema.js';
import { createJoiError, createSingleError } from '../helper/error.js';
import { insertActivity } from './activity_service.js';
import { getTransactionsByGroupId } from './transactions_service.js';
import { getUserById, insertIfNotExist } from './user_service.js';
const GroupInfoModel = require('../models/GroupInfoModel');
var _ = require('lodash');

export async function createGroup(parent, args) {
    console.log('Group Create Message ', args);
    return createOrUpdateGroup(parent, args, false);
}

export async function updateGroup(parent, args) {
    console.log("Inside update group post Request");
    return createOrUpdateGroup(parent, args, true);
}

async function createOrUpdateGroup(parent, args, isUpdate) {
    let group = args.group;
    const { value, error } = isUpdate ? updategroupschema.validate(group) : creategroupschema.validate(group);
    if (error) {
        return createJoiError(error);
    }
    group = value;
    try {
        const modifiedGroup = JSON.parse(JSON.stringify(group));
        if (!isUpdate) {
            modifiedGroup.id = uuidv4();
            group.id = modifiedGroup.id;
        }

        modifiedGroup.members = group.members.map((member) => member.email);
        modifiedGroup.group_join_status = group.members.map((member) => member.group_join_status || GroupJoinStatus.JOINED);
        if (!isUpdate) {
            console.log("Inside GroupInfo Create  " + JSON.stringify(modifiedGroup));
            var groupInfo = new GroupInfoModel(modifiedGroup);
            await groupInfo.save();
        } else {
            console.log("GroupInfo GroupInfo Update ", JSON.stringify(modifiedGroup));
            const value = await GroupInfoModel.findOneAndUpdate(
                { id: modifiedGroup.id },
                { ...modifiedGroup },
                { new: true }
            );
            await value.save();
        }
        await Promise.all(group.members.map((member) =>
            insertIfNotExist(member)));
        if (isUpdate) {
            const storedGroup = await getGroupById(group.id);
            const newMembers = _.difference(group.to, storedGroup.to);
            await Promise.all(newMembers.filter((member) => member.email != storedGroup.creator).map((member) => insertActivity(buildMemberAddedActivity(group.creator, group, member))));
        } else {
            await Promise.all(group.members.filter((member) => member.email != group.creator).map((member) => insertActivity(buildMemberAddedActivity(group.creator, group, member))));
        }

        if (!isUpdate) {
            await insertActivity(buildGroupCreatedActivity(group.creator, group));
        }
        return { __typename: isUpdate ? "UpdateGroupSuccess" : "CreateGroupSuccess", group };
    } catch (error) {
        console.log("Error ", error);
        return createSingleError("Unable to successfully insert/update the Group");
    }
}

export async function leaveGroup(parent, args) {
    console.log("Inside leave group post Request");
    const { groupId, userId } = args;
    try {
        const storedGroup = JSON.parse(JSON.stringify(await getGroupById(groupId)));
        const newMembersWithJoinStatus = _.remove(_.zipWith(
            storedGroup.members,
            storedGroup.group_join_status,
            (member, group_join_status) => ({ member, group_join_status })
        ), (mg) => mg.member != userId);
        storedGroup.members = newMembersWithJoinStatus.map((mg) => mg.member);
        storedGroup.group_join_status = newMembersWithJoinStatus.map((mg) => mg.group_join_status);
        //UPDATE GROUP USING MONGO DB    
        const value = await GroupInfoModel.findOneAndUpdate(
            { id: storedGroup.id },
            { ...storedGroup },
            { new: true }
        );
        await value.save();
        const user = await getUserById(userId);
        await insertActivity(buildMemberDeletedActivity(user.email, storedGroup, user));
        return { __typename: "Success", success: "Successfully Left" }
    } catch (error) {
        console.log(error);
        return createSingleError('Unable to successfully leave the Group!');
    }
}

export async function joinGroup(parent, args) {
    console.log("Inside join group post Request");
    const { groupId, userId } = args;
    try {
        let storedGroup = await getGroupById(groupId);
        if (!storedGroup) {
            return createSingleError("Invalid Group ID.");
        }
        storedGroup = storedGroup.toObject();
        const members_with_join_status = _.zipWith(
            storedGroup.members,
            storedGroup.group_join_status,
            (member, group_join_status) => {
                if (member === userId) {
                    return { member, group_join_status: 'JOINED' };
                }
                return { member, group_join_status };
            }
        );

        storedGroup.members = members_with_join_status.map((m) => m.member);
        storedGroup.group_join_status = members_with_join_status.map((m) => m.group_join_status);
        console.log("storedGroupRRR ", JSON.stringify(storedGroup));
        const value = await GroupInfoModel.findOneAndUpdate(
            { id: storedGroup.id },
            { ...storedGroup },
            { new: true }
        );
        await value.save();
        const user = await getUserById(userId);
        await insertActivity(buildMemberJoinedActivity(user.email, storedGroup, user));
        return { __typename: "Success", success: "Successfully Joined" }
    } catch (error) {
        console.log(error);
        return createSingleError('Unable to successfully join the Group!');
    }
}

export async function getGroupDetails(parent, args) {
    console.log("inside get group details", args.id);
    let groupId = args.id;
    console.log("Inside get group details Request");
    try {
        const group = await getGroupById(groupId);
        if (!group) {
            return createSingleError("Invalid group ID");
        }
        const members = await Promise.all(
            group.members.map((member) => getUserById(member))
        );
        const modifiedGroup = group;
        const newMembers = _.zipWith(
            JSON.parse(JSON.stringify(members)),
            group.group_join_status,
            (m, g) => ({ ...m, group_join_status: g })
        );
        modifiedGroup.members = newMembers;
        console.log("modifi ", modifiedGroup);
        return { __typename: "Group", ...(modifiedGroup.toObject()) };
    } catch (err) {
        console.log(err);
        return createSingleError("Unable to successfully get the Group");
    }
}

export async function getAllGroupsForUser(parent, args) {
    let userId = args.userId;
    console.log("Inside get all group details Request");
    try {
        const groups = await getGroupsByUserId(userId);
        const modifiedGroups = await Promise.all(groups.map(async (group) => {
            const members = await Promise.all(group.members.map((member) => getUserById(member)));
            const modifiedGroup = group;
            console.log("GG Group", group);
            const newMembers = _.zipWith(
                JSON.parse(JSON.stringify(members)),
                group.group_join_status,
                (m, g) => ({ ...m, group_join_status: g })
            );
            modifiedGroup.members = newMembers;
            console.log("Modified Group", modifiedGroup);
            const transactions = await getTransactionsByGroupId(group.id);
            modifiedGroup.transactions = transactions;
            return modifiedGroup;
        }));
        return { __typename: "GroupList", groups: modifiedGroups };
    } catch (err) {
        console.log(err);
        return createSingleError("Failed to get the groups");
    }
}


async function getGroupById(groupId) {
    const group = await GroupInfoModel.findOne(
        { id: groupId }
    );
    return group;
}

async function getGroupsByUserId(userId) {
    console.log("Inside get Groups By User ID");
    const result = await GroupInfoModel.find({ "members": userId });
    console.log("Results ", JSON.stringify(result));
    return result;
}

function buildMemberAddedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        added: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_ADDED
    }));
}

function buildMemberDeletedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        deleted: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_DELETED
    }));
}

function buildMemberJoinedActivity(creator, group, member) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        joined: {
            email: member.email,
            name: member.name,
        },
        type: ActivityType.MEMBER_JOINED
    }));
}

function buildGroupCreatedActivity(creator, group) {
    return JSON.parse(JSON.stringify({
        user_id: creator,
        group: {
            id: group.id,
            name: group.name
        },
        type: ActivityType.GROUP_CREATION
    }));
}
