const mongoose = require('mongoose');
const constants = require('../../lib/util/constants');

const sutSchema = new mongoose.Schema({
  name: {
    type : String,
    required: [true, constants.REQURIED_SUT_NAME_ERR]
  },
  members: {
    type : Array, 
    default : []
  }
});

module.exports = mongoose.model('SUT', sutSchema);
