var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
    type: {
        type: String
    },
    dateTime: {
        type: Date
    },
    data: {
        type: String
    },
    user: {
        type: String
    },
    link: {
        type: String
    }
});

mongoose.model('Event', eventSchema);
