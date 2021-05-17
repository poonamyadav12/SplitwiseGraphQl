import axios from 'axios';
import { client } from '..';
import { getGroupList } from '../graphql/query';
import { SERVER_URL } from '../_constants';

export async function fetchData(userId) {
  const response = await client.query({
    query: getGroupList,
    variables: { userId },
  });

  if (response.data.getGroupList.error) {
    console.log("Error while fetching groups ", response.data.getGroupList.error)
    return {};
  }
  const groups = response.data.getGroupList.groups;

  let friendsMap = new Map();
  groups
    .flatMap((group) => JSON.parse(JSON.stringify(group.members)))
    .filter((member) => member.email !== userId)
    .forEach((member_1) => friendsMap.set(member_1.email, member_1));
  return { groups, friends: Array.from(friendsMap.values()) };
}
