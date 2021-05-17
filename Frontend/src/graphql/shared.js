import { gql } from 'apollo-boost';

export const UserFragment = gql`
  #graphql
  fragment UserFragment on User {
    email
    first_name
    last_name
    avatar
    password
    country_code
    default_currency
    registration_status
    time_zone
    created_at
    updated_at
    phone_number
  }
`;

export const GroupUserFragment = gql`
  #graphql
  fragment GroupUserFragment on GroupUser {
    email
    first_name
    last_name
    avatar
    password
    country_code
    default_currency
    registration_status
    time_zone
    created_at
    updated_at
    phone_number
    group_join_status
  }
`;

export const GroupFragment = gql`
  #graphql
  fragment GroupFragment on Group {
    id
    creator
    name
    avatar
    members {
      email
    }
  }
`;

export const GroupDetailsFragment = gql`
  #graphql
  ${GroupUserFragment}
  fragment GroupDetailsFragment on Group {
    id
    creator
    name
    avatar
    members {
      ...GroupUserFragment
    }
  }
`;

export const CommentFragment = gql`
  #graphql
  ${UserFragment}
  fragment CommentFragment on Comment {
    _id
    comment
    createdAt
    user {
      ...UserFragment
    }
  }
`;

export const TransactionGroupFragment = gql`
  #graphql
  fragment TransactionGroupFragment on TransactionGroup {
    id
    creator
    name
    avatar
    members
  }
`;

export const TransactionFragment = gql`
  #graphql
  ${UserFragment}
  ${CommentFragment}
  ${TransactionGroupFragment}
  fragment TransactionFragment on Transaction {
    from {
      ...UserFragment
    }
    to {
      ...UserFragment
    }
    amount
    currency_code
    id
    group_id
    group {
      ...TransactionGroupFragment
    }
    description
    status
    type
    createdAt
    comments {
      ...CommentFragment
    }
  }
`;
