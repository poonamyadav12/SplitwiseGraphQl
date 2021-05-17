import { gql } from 'apollo-boost';
import { GroupFragment, TransactionFragment, UserFragment } from './shared';

export const createUser = gql`
  #graphql
  ${UserFragment}
  mutation signup(
    $email: String!
    $first_name: String!
    $last_name: String
    $password: String!
    $avatar: String!
    $country_code: String
    $default_currency: String!
    $registration_status: RegistrationStatus!
    $time_zone: String
    $phone_number: String
  ) {
    signup(
      user: {
        email: $email
        first_name: $first_name
        last_name: $last_name
        password: $password
        avatar: $avatar
        country_code: $country_code
        default_currency: $default_currency
        registration_status: $registration_status
        time_zone: $time_zone
        phone_number: $phone_number
      }
    ) {
      ... on SignupSuccess {
        user {
          ...UserFragment
        }
        token
      }
      ... on Error {
        error
      }
    }
  }
`;

export const loginUser = gql`
  #graphql
  ${UserFragment}
  mutation login($id: String!, $password: String!) {
    login(id: $id, password: $password) {
      ... on LoginSuccess {
        user {
          ...UserFragment
        }
        token
      }
      ... on Error {
        error
      }
    }
  }
`;

export const updateUser = gql`
  #graphql
  ${UserFragment}
  mutation updateUser(
    $email: String!
    $first_name: String!
    $last_name: String
    $password: String!
    $avatar: String!
    $country_code: String
    $default_currency: String!
    $registration_status: RegistrationStatus
    $time_zone: String
    $phone_number: String
    $new_password: String
    $_id: String
  ) {
    updateUser(
      user: {
        email: $email
        first_name: $first_name
        last_name: $last_name
        password: $password
        avatar: $avatar
        country_code: $country_code
        default_currency: $default_currency
        registration_status: $registration_status
        time_zone: $time_zone
        phone_number: $phone_number
        new_password: $new_password
        _id: $_id
      }
    ) {
      ... on UpdateUserSuccess {
        user {
          ...UserFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const createGroup = gql`
  #graphql
  ${GroupFragment}
  mutation createGroup(
    $creator: String!
    $name: String!
    $avatar: String!
    $members: [InvitedUserInput!]
  ) {
    createGroup(
      group: {
        creator: $creator
        name: $name
        avatar: $avatar
        members: $members
      }
    ) {
      ... on CreateGroupSuccess {
        group {
          ...GroupFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const updateGroup = gql`
  #graphql
  ${GroupFragment}
  mutation updateGroup(
    $id: String!
    $creator: String!
    $name: String!
    $avatar: String!
    $members: [InvitedUserInput!]
  ) {
    updateGroup(
      group: {
        id: $id
        creator: $creator
        name: $name
        avatar: $avatar
        members: $members
      }
    ) {
      ... on UpdateGroupSuccess {
        group {
          ...GroupFragment
        }
      }
      ... on Error {
        error
      }
    }
  }
`;

export const createTransaction = gql`
  #graphql
  mutation createTransaction(
    $from: String!
    $to: [String]!
    $amount: Float!
    $currency_code: String!
    $group_id: String!
    $description: String!
    $status: String!
    $type: String!
    $comments: [CommentInput]
  ) {
    createTransaction(
      transaction: {
        from: $from
        to: $to
        amount: $amount
        currency_code: $currency_code
        group_id: $group_id
        description: $description
        status: $status
        type: $type
        comments: $comments
      }
    ) {
      ... on Error {
        error
      }
    }
  }
`;

export const updateTransaction = gql`
  #graphql
  mutation updateTransaction(
    $id: String!
    $from: String!
    $to: [String]!
    $amount: Float!
    $currency_code: String!
    $group_id: String!
    $description: String!
    $status: String!
    $type: String!
    $comments: [CommentInput]
  ) {
    updateTransaction(
      transaction: {
        id: $id
        from: $from
        to: $to
        amount: $amount
        currency_code: $currency_code
        group_id: $group_id
        description: $description
        status: $status
        type: $type
        comments: $comments
      }
    ) {
      ... on Error {
        error
      }
    }
  }
`;

export const addComment = gql`
  #graphql
  ${TransactionFragment}
  mutation addComment($txnId: String!, $comment: String!, $userId: String!) {
    addComment(body: { txnId: $txnId, comment: $comment, userId: $userId }) {
      ...TransactionFragment
      ... on Error {
        error
      }
    }
  }
`;

export const deleteComment = gql`
  #graphql
  mutation deleteComment($_id: String!) {
    deleteComment(_id: $_id) {
      ... on Error {
        error
      }
    }
  }
`;

export const settleUpTransaction = gql`
  #graphql

  mutation settleUpTransaction($transactions: [TransactionInput!]!) {
    settleUpTransaction(transactions: $transactions) {
      ... on Error {
        error
      }
    }
  }
`;

export const joinGroupMutation = gql`
  #graphql
  mutation joinGroup($groupId: String!, $userId: String!) {
    joinGroup(groupId: $groupId, userId: $userId) {
      ... on Error {
        error
      }
    }
  }
`;

export const leaveGroupMutation = gql`
  #graphql
  mutation leaveGroup($groupId: String!, $userId: String!) {
    leaveGroup(groupId: $groupId, userId: $userId) {
      ... on Error {
        error
      }
    }
  }
`;
