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
	isPinned: {
		type: Object
	},
	isTrashed: {
		type: Object
	},
	timestamp: {
		type: Date
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
