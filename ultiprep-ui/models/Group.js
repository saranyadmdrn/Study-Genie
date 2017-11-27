var mongoose = require('mongoose');

var groupSchema = mongoose.Schema({
    groupName: {
        type: String
    },
    members: {
        type: [String]
    }
});

mongoose.model('Group', groupSchema);
