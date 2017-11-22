var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({
	author: {
		type: String
	},
	tags: [{
		type: String
	}]
});

mongoose.model('Tag', tagSchema);
