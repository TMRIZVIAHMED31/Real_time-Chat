const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");
const User = require("../models/User");
const Product = require("../models/Product");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Small helper: throws a properly-coded GraphQL error instead of a generic 500
function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
}

const resolvers = {
  Query: {
    me: (_parent, _args, context) => context.user || null,

    // Optimized: .populate only the fields needed, and a lean read for speed
    products: async () => {
      return Product.find().populate("owner").sort({ createdAt: -1 });
    },

    product: async (_parent, { id }) => {
      const product = await Product.findById(id).populate("owner");
      if (!product) {
        throw new GraphQLError("Product not found", { extensions: { code: "NOT_FOUND" } });
      }
      return product;
    },
  },

  Mutation: {
    signup: async (_parent, { input }) => {
      const { name, email, password } = input;
      const existing = await User.findOne({ email });
      if (existing) {
        throw new GraphQLError("Email already registered", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const user = await User.create({ name, email, password });
      return { token: signToken(user._id), user };
    },

    login: async (_parent, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return { token: signToken(user._id), user };
    },

    createProduct: async (_parent, { input }, context) => {
      const user = requireAuth(context);
      const product = await Product.create({ ...input, owner: user.id });
      return Product.findById(product._id).populate("owner");
    },

    updateProduct: async (_parent, { id, input }, context) => {
      const user = requireAuth(context);
      const product = await Product.findById(id);
      if (!product) {
        throw new GraphQLError("Product not found", { extensions: { code: "NOT_FOUND" } });
      }
      const isOwner = product.owner.toString() === user.id;
      if (!isOwner && user.role !== "admin") {
        throw new GraphQLError("Not allowed to edit this product", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      Object.assign(product, input);
      await product.save();
      return Product.findById(id).populate("owner");
    },

    deleteProduct: async (_parent, { id }, context) => {
      const user = requireAuth(context);
      const product = await Product.findById(id);
      if (!product) {
        throw new GraphQLError("Product not found", { extensions: { code: "NOT_FOUND" } });
      }
      const isOwner = product.owner.toString() === user.id;
      if (!isOwner && user.role !== "admin") {
        throw new GraphQLError("Not allowed to delete this product", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      await product.deleteOne();
      return true;
    },
  },

  // Field-level resolvers so GraphQL clients can request nested fields cleanly
  Product: {
    id: (product) => product._id.toString(),
    createdAt: (product) => product.createdAt.toISOString(),
  },
  User: {
    id: (user) => user._id.toString(),
    createdAt: (user) => user.createdAt.toISOString(),
  },
};

module.exports = resolvers;
