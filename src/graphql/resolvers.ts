import { Todo } from "../models/Todo.js";
import mongoose from "mongoose";
import { GraphQLError } from "graphql";
function checkId(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new GraphQLError("Invalid todo id");
  }
}
export const resolvers = {
  Query: {
    todos: async (_parent: unknown, args: { completed?: boolean }) => {
      if (args.completed === undefined) {
        return Todo.find();
      }
      return Todo.find({ completed: args.completed });
    },
    todo: async (_parent: unknown, args: { id: string }) => {
      checkId(args.id);
      return Todo.findById(args.id);
    },
  },

  Mutation: {
    createTodo: async (
      _parent: unknown,
      args: { input: { title: string; description?: string } },
    ) => {
      const newTodo = await Todo.create(args.input);
      return newTodo;
    },

    updateTodo: async (
      _parent: unknown,
      args: {
        id: string;
        input: { title?: string; description?: string; completed?: boolean };
      },
    ) => {
      checkId(args.id);
      const todo = await Todo.findById(args.id);
      if (todo === null) return null;
      todo.set(args.input);
      await todo.save();
      return todo;
    },

    toggleTodo: async (_parent: unknown, args: { id: string }) => {
      checkId(args.id);
      const todo = await Todo.findById(args.id);
      if (todo === null) return null;
      todo.completed = !todo.completed;
      await todo.save();
      return todo;
    },

    deleteTodo: async (_parent: unknown, args: { id: string }) => {
      checkId(args.id);
      const todo = await Todo.findById(args.id);
      if (todo === null) return false;
      await todo.deleteOne();
      return true;
    },
  },

  Todo: {
    createdAt: (todo: { createdAt: Date }) => todo.createdAt.toISOString(),
    updatedAt: (todo: { updatedAt: Date }) => todo.updatedAt.toISOString(),
  },
};
