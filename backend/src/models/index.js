// Export all models from a single file for easy importing

const User = require('./User');
const Route = require('./Route');
const Bus = require('./Bus');
const Station = require('./Station');
const Assignment = require('./Assignment');
const Request = require('./Request');
const RefreshToken = require('./RefreshToken');

module.exports = {
  User,
  Route,
  Bus,
  Station,
  Assignment,
  Request,
  RefreshToken,
};

