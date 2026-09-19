// Apollo Server v4 accepts a plain template string as the schema —
// the `#graphql` comment just enables editor syntax highlighting, no extra package needed.
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    owner: User!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String!
    description: String
    price: Float!
    stock: Int
  }

  type Query {
    "Currently authenticated user"
    me: User

    "All products, newest first"
    products: [Product!]!

    "A single product by id"
    product(id: ID!): Product
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    "Requires auth. Creates a product owned by the logged-in user."
    createProduct(input: ProductInput!): Product!

    "Requires auth. Only the owner or an admin can update."
    updateProduct(id: ID!, input: ProductInput!): Product!

    "Requires auth. Only the owner or an admin can delete."
    deleteProduct(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
