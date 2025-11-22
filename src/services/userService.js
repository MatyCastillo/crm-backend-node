const User = require('../models/userModel');

module.exports = {
  getAllUsers: () => {
    return User.findAll();
  },

  getUserById: (userId) => {
    return User.findByPk(userId);
  },

  createUser: (userData) => {
    const { username, email, password } = userData;
    return User.create({ username, email, password });
  },

  updateUser: async (userId, userData) => {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const { username, email, password } = userData;
    user.username = username;
    user.email = email;
    user.password = password;
    await user.save();
    return user;
  },

  deleteUser: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    await user.destroy();
  }
};
