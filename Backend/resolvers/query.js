import { getUserById } from "../services/user_service";
import * as groupApi from "../services/group_service";
import * as txnApi from "../services/transactions_service";
import * as userApi from "../services/user_service";
import * as activityApi from "../services/activity_service"

export const Query = {
  async getUser(parent, args) {
    const user = await getUserById(args.email);
    return {
      __typename: "User", ...(user.toObject())
    };
  },
  getGroup: groupApi.getGroupDetails,
  getGroupList: groupApi.getAllGroupsForUser,
  getGroupTransactions: txnApi.getAllTransactionsForGroup,
  getUserTransactions: txnApi.getAllTransactionsForUser,
  searchUser: userApi.getUsersBySearchString,
  getFriendTransactions: txnApi.getAllTransactionsForFriend,
  getActivity:activityApi.getActivitiesV2,
}
