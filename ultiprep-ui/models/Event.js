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
    }
});

mongoose.model('Event', eventSchema);
