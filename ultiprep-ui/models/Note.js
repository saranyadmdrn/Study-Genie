var mongoose = require('mongoose');

var noteSchema = mongoose.Schema({
	title: {
		type: String
	},
	content: {
		type: String
	},
	dateCreated: {
		type: String
	},
	tags: {
		type: [String]
	},
	colorClass: {
		type: String
	},
	isPinned: {
		type: Boolean
	},
	isTrashed: {
		type: Boolean
	},
	timestamp: {
		type: Number
	},
	author: {
		type: String
	},
	public: {
		type: Boolean
	},
	contributors: {
		type: [String]
	}
});

mongoose.model('Note', noteSchema);
