var mongoose = require('mongoose');

var groupSchema = mongoose.Schema({
    name: {
        type: String
    },
    members: {
        type: [String]
    }
});

mongoose.model('Group', groupSchema);
