import { gql } from 'apollo-boost';
import {
  GroupDetailsFragment,
  TransactionFragment,
  UserFragment,
} from './shared';

export const getGroup = gql`
  #graphql
  ${GroupDetailsFragment}
  query getGroup($id: String!) {
    getGroup(id: $id) {
      ...GroupDetailsFragment
      ... on Error {
        error
      }
    }
  }
`;

export const getGroupList = gql`
  #graphql
  ${GroupDetailsFragment}
  query getGroupList($userId: String!) {
    getGroupList(userId: $userId) {
      ... on GroupList {
        groups {
          ...GroupDetailsFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const getGroupTransactions = gql`
  #graphql
  ${TransactionFragment}
  query getGroupTransactions($groupId: String!) {
    getGroupTransactions(groupId: $groupId) {
      ... on TransactionList {
        transactions {
          ...TransactionFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const getUserTransactions = gql`
  #graphql
  ${TransactionFragment}
  query getUserTransactions($userId: String!) {
    getUserTransactions(userId: $userId) {
      ... on TransactionList {
        transactions {
          ...TransactionFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const getFriendTransactions = gql`
  #graphql
  ${TransactionFragment}
  query getFriendTransactions($friendId: String!, $userId: String!) {
    getFriendTransactions(friendId: $friendId, userId: $userId) {
      ... on TransactionList {
        transactions {
          ...TransactionFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const getActivity = gql`
  #graphql
  ${UserFragment}
  query getActivity($userId: String!, $options: ActivityOptions!) {
    getActivity(userId: $userId, options: $options) {
      ... on PaginatedActivityList {
        totalPages
        totalDocs
        hasPrevPage
        hasNextPage
        docs {
          creator {
            ...UserFragment
          }
          joined {
            ...UserFragment
          }
          added {
            ...UserFragment
          }
          deleted {
            ...UserFragment
          }
          group {
            id
            creator
            name
            avatar
            members
          }
          transaction {
            id
            from
            to
            description
            currency_code
            amount
            group_id
            type
          }
          type
          user_id
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const searchUser = gql`
  #graphql
  ${UserFragment}
  query searchUser($queryString: String!, $limit: Float!) {
    searchUser(queryString: $queryString, limit: $limit) {
      ... on UserList {
        users {
          ...UserFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;
