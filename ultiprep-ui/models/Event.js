var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
    type: {
        type: String
    },
    dateCreated: {
        type: String
    },
    timeStamp: {
        type: Number
    },
    data: {
        type: Object
    },
    user: {
        type: String
    },
    score: {
        type: Number
    }
});

mongoose.model('Event', eventSchema);
