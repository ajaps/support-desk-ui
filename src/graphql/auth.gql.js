import { gql } from "@apollo/client/core";

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      token
      user { id name email role }
      errors
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($name: String!, $email: String!, $password: String!, $role: String) {
    signUp(input: { name: $name, email: $email, password: $password, role: $role }) {
      token
      user { id name email role }
      errors
    }
  }
`;