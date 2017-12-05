var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var moment = require('moment');

var User = mongoose.model('User');
var Note = mongoose.model('Note');
var Tag = mongoose.model('Tag');
var Event = mongoose.model('Event');
var Group = mongoose.model('Group');

var router = express.Router();

var auth = jwt({
    secret: 'ULTIPREP_SECRET',
    userProperty: 'payload'
});

var getCurrentDate = function() {

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = new Date();
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
};

var signUp = function(req, res) {

    if (!req.body.name || !req.body.email || !req.body.password) {
        res.status(400).json({
            message: 'Requried fields are empty.'
        });
        return;
    }

    var user = new User();

    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    user.save(function(err) {

        if (err) {
            res.status(401).json({
                message: 'This email id is already being used.'
            });
            return;
        }

        // Save some default tags
        var tag = new Tag();
        tag.author = user._id;
        tag.tags = ['Java', 'Javascript', 'SQL', 'MongoDB'];
        tag.save(function(err) {
            if (err) {
                res.status(401).json({
                    message: 'Error while generating user tags.'
                });
                return;
            }
        });

        // Save some default notes
        // var note;
        //
        // note = new Note();
        // note.title = '';
        // note.content = '<p>Easily identify & organize your notes with colors and tags.</p>';
        // note.dateCreated = getCurrentDate();
        // note.tags = ['Personal', 'Miscellaneous'];
        // note.isPinned = {};
        // note.isPinned[user._id] = false;
        // note.isTrashed = {};
        // note.isTrashed[user._id] = false;
        // note.timestamp = Math.floor(Date.now() / 1000) + 0;
        // note.author = user._id;
        // note.public = true;
        // note.contibutors = [];
        // note.save(function(err) {
        //     if (err) {
        //         res.status(401).json({
        //             message: 'Error while generating user notes.'
        //         });
        //         return;
        //     }
        // });
        //
        // note = new Note();
        // note.title = 'Everything at one place';
        // note.content = '<p>Find your notes from any device - laptop, tablet, smartphone.</p><p>Capture a note once, and access it from anywhere.</p>';
        // note.dateCreated = getCurrentDate();
        // note.tags = ['Miscellaneous'];
        // note.isPinned = {};
        // note.isPinned[user._id] = false;
        // note.isTrashed = {};
        // note.isTrashed[user._id] = false;
        // note.timestamp = Math.floor(Date.now() / 1000) + 1;
        // note.author = user._id;
        // note.public = true;
        // note.contibutors = [];
        // note.save(function(err) {
        //     if (err) {
        //         res.status(401).json({
        //             message: 'Error while generating user notes.'
        //         });
        //         return;
        //     }
        // });
        //
        // note = new Note();
        // note.title = '';
        // note.content = '<p>Done with a note?</p><p>Just send to the <em>archive</em>, where you can always find it later.</p>';
        // note.dateCreated = getCurrentDate();
        // note.tags = [];
        // note.isPinned = {};
        // note.isPinned[user._id] = false;
        // note.isTrashed = {};
        // note.isTrashed[user._id] = false;
        // note.timestamp = Math.floor(Date.now() / 1000) + 2;
        // note.author = user._id;
        // note.public = true;
        // note.contibutors = [];
        // note.save(function(err) {
        //     if (err) {
        //         res.status(401).json({
        //             message: 'Error while generating user notes.'
        //         });
        //         return;
        //     }
        // });
        //
        // note = new Note();
        // note.title = 'Welcome to ng-notes';
        // note.content = '<p>Capture your ideas effortlessly with NGN. <span class="fr-emoticon fr-deletable fr-emoticon-img" style="background: url(https://cdnjs.cloudflare.com/ajax/libs/emojione/2.0.1/assets/svg/1f604.svg);">&nbsp;</span><span class="fr-emoticon fr-deletable fr-emoticon-img" style="background: url(https://cdnjs.cloudflare.com/ajax/libs/emojione/2.0.1/assets/svg/1f606.svg);">&nbsp;</span><br><br>To add a new note, click on the <strong>+</strong> icon below.</p>';
        // note.dateCreated = getCurrentDate();
        // note.tags = [];
        // note.isPinned = {};
        // note.isPinned[user._id] = false;
        // note.isTrashed = {};
        // note.isTrashed[user._id] = false;
        // note.timestamp = Math.floor(Date.now() / 1000) + 3;
        // note.author = user._id;
        // note.public = false;
        // note.contibutors = [];
        // note.save(function(err) {
        //     if (err) {
        //         res.status(401).json({
        //             message: 'Error while generating user notes.'
        //         });
        //         return;
        //     }
        // });

        var group = new Group();
        group.groupName = "Adaptive Web";
        group.members = [];
        group.members.push(user._id);

        group.save(function (err) {
            if (err)
                res.status(401).json({
                    message: 'Error while generating groups.'
                });
            return;
        });

        // Generate a JWT for user login
        var token = user.generateJwt();
        res.status(200).json({
            token: token
        });
    });
};

var logIn = function(req, res) {

    if (!req.body.email || !req.body.password) {
        res.status(400).json({
            message: 'Email and password required.'
        });
        return;
    }

    passport.authenticate('local', function(err, user, info) {

        var token;

        if (err) {
            res.status(404).json(err);
            return;
        }

        if (user) {
            token = user.generateJwt();
            res.status(200).json({
                token: token
            });
        } else {
            res.status(401).json(info);
        }
    })(req, res);
};

var getUser = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    User.findById(req.payload._id).exec(function(err, user) {
        if (err)
            res.status(401).json(err);
        else if (user === null)
            res.status(401).json({
                message: 'User not found.'
            });
        else
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email
            });
    });
};

var updateUser = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var user = req.body;
    var query = { _id: user._id };
    delete user._id;
    delete user.__v;
    User.findOneAndUpdate(query, user, { upsert: true }).exec(function(err, user) {
        if (err) {
            if (err.message.indexOf('E11000') !== -1)
                res.status(401).json({
                    message: 'This email id is already registered.'
                });
            else
                res.status(401).json(err);
        } else
            res.status(200).json(user);
    });
};

var getUserTags = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var query = { author: req.payload._id };
    Tag.findOne(query).exec(function(err, tags) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(tags);
    });
};

var addTag = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var tag = req.params.tag;
    var query = { author: req.payload._id };
    Tag.findOneAndUpdate(query, { $push: { tags: tag } }).exec(function(err, tags) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(tags);
    });
};

var deleteTag = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var tag = req.params.tag;
    var query = { author: req.payload._id };
    Tag.findOneAndUpdate(query, { $pullAll: { tags: [tag] } }).exec(function(err, tags) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(tags);
    });
};

var getNotes = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var query = { $or: [ { author: req.payload._id }, { public: true }, {contributors: {$in: [req.payload._id]} } ] };
    Note.find(query).exec(function(err, notes) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(notes);
    });
};

var addNote = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var newNote = req.body;
    newNote.author = req.payload._id;
    var note = new Note(newNote);
    note.save(function(err) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(note);
    });
};

var updateNote = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var note = req.body;
    var query = { _id: note._id };
    delete note._id;
    delete note.__v;
    console.log(note);
    Note.findOneAndUpdate(query, note, { upsert: true }).exec(function(err, note) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(note);
    });
};

var deleteNote = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var query = { _id: req.params.id };
    Note.remove(query).exec(function(err, result) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(result);
    });
};

var postEvent = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var receivedEvent = req.body;

    receivedEvent.user = req.payload._id;

    var newEvent = new Event(receivedEvent);

    newEvent.save(function(err) {
        if (err)
            res.status(401).json(err);
        else
            res.status(200).json(newEvent);
    });

}

var getUsers = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var query = { };
    User.find(query).exec(function(err, users) {
        if (err)
            res.status(401).json(err);
        else {
            var user = {};
            for (var i = 0; i < users.length; i++) {
                user[users[i]._id.toString()] = users[i].name;
            }
            res.status(200).json(user);
        }
    });

}

var getUserGroups = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var query = { members: req.payload._id};
    Group.find(query).exec(function(err, groups) {
        if (err)
            res.status(401).json(err);
        else {
            res.status(200).json(groups);
        }
    });
}

var joinGroup = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var group = req.body;
    console.log("*******************************************");
    var query = { _id: group._id};

    delete group._id;
    delete group.__v;

    var index = group.members.indexOf(req.payload._id);
    if (index == -1) {
        group.members.push(req.payload._id);
    }

    Group.findOneAndUpdate(query, group, { upsert: true }).exec(function(err, group) {
        if (err) {
            res.status(401).json(err);
        } else
            res.status(200).json(group);
    });

}

var leaveGroup = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var group = req.body;
    var query = { _id: group._id};

    delete group._id;
    delete group.__v;

    var index = group.members.indexOf(req.payload._id);
    if (index !== -1) {
        group.members.splice(index, 1);
    }

    Group.findOneAndUpdate(query, group, { upsert: true }).exec(function(err, user) {
        if (err) {
            res.status(401).json(err);
        } else
            res.status(200).json(user);
    });

}

var getAllGroups = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var query = {};

    Group.find(query).exec(function(err, groups) {
        if (err) {
            res.status(401).json(err);
        } else
            res.status(200).json(groups);
    });

}

var getUsageData = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    getUserUsage(req.payload._id, res);

}

function getUserUsage(id, res) {
    var userUsageQueryResults = {
        earlyMorning: 0,
        morning: 0,
        noon: 0,
        evening: 0,
        night: 0
    };

    var othersUsageQueryResults = {
        earlyMorning: 0,
        morning: 0,
        noon: 0,
        evening: 0,
        night: 0,
        count: 0
    };

    Event.find({ 'user': id }, function(err, userEvents) {
        if (err)
            res.status(401).json(err);
        else {

            Event.find({ 'user': { $ne: id } }, function(err, otherEvents) {
                if (err)
                    res.status(401).json(err);
                else {
                    User.count().exec(function(err, count) {

                        for (var i = userEvents.length - 1; i >= 0; i--) {
                            var currentTime= moment(userEvents[i].timeStamp, "HH:mm a");

                            if (currentTime.isBetween(moment('00:00a', "HH:mm a"), moment('05:59a', "HH:mm a"))) {
                                userUsageQueryResults.earlyMorning++;
                            } else if (currentTime.isBetween(moment('06:00a', "HH:mm a"), moment('10:59a', "HH:mm a"))) {
                                userUsageQueryResults.morning++;
                            } else if (currentTime.isBetween(moment('11:00a', "HH:mm a"), moment('03:59p', "HH:mm a"))) {
                                userUsageQueryResults.noon++;
                            } else if (currentTime.isBetween(moment('04:00p', "HH:mm a"), moment('07:59p', "HH:mm a"))) {
                                userUsageQueryResults.evening++;
                            } else if (currentTime.isBetween(moment('08:00p', "HH:mm a"), moment('11:59p', "HH:mm a"))) {
                                userUsageQueryResults.night++;
                            }
                        }

                        console.log(userUsageQueryResults);



                        for (var i = otherEvents.length - 1; i >= 0; i--) {
                            currentTime= moment(otherEvents[i].timeStamp, "HH:mm a");

                            if (currentTime.isBetween(moment('00:00a', "HH:mm a"), moment('05:59a', "HH:mm a"))) {
                                othersUsageQueryResults.earlyMorning++;
                            } else if (currentTime.isBetween(moment('06:00a', "HH:mm a"), moment('10:59a', "HH:mm a"))) {
                                othersUsageQueryResults.morning++;
                            } else if (currentTime.isBetween(moment('11:00a', "HH:mm a"), moment('03:59p', "HH:mm a"))) {
                                othersUsageQueryResults.noon++;
                            } else if (currentTime.isBetween(moment('04:00p', "HH:mm a"), moment('07:59p', "HH:mm a"))) {
                                othersUsageQueryResults.evening++;
                            } else if (currentTime.isBetween(moment('08:00p', "HH:mm a"), moment('11:59p', "HH:mm a"))) {
                                othersUsageQueryResults.night++;
                            }
                        }

                        console.log(othersUsageQueryResults);

                        var graphThreeResult = {
                            userResults: [],
                            othersResults: []
                        };

                        graphThreeResult.userResults[0] = Math.round(userUsageQueryResults.earlyMorning * 1.5);
                        graphThreeResult.userResults[1] = Math.round(userUsageQueryResults.morning * 1.5);
                        graphThreeResult.userResults[2] = Math.round(userUsageQueryResults.noon * 1.5);
                        graphThreeResult.userResults[3] = Math.round(userUsageQueryResults.evening * 1.5);
                        graphThreeResult.userResults[4] = Math.round(userUsageQueryResults.night * 1.5);

                        graphThreeResult.othersResults[0] = Math.round((othersUsageQueryResults.earlyMorning * 1.5) / count);
                        graphThreeResult.othersResults[1] = Math.round((othersUsageQueryResults.morning * 1.5) / count);
                        graphThreeResult.othersResults[2] = Math.round((othersUsageQueryResults.noon * 1.5) / count);
                        graphThreeResult.othersResults[3] = Math.round((othersUsageQueryResults.evening * 1.5) / count);
                        graphThreeResult.othersResults[4] = Math.round((othersUsageQueryResults.night * 1.5) / count);

                        console.log(graphThreeResult.userResults);

                        res.status(200).json(graphThreeResult);
                    });

                }
            });

        }
    });
}

var getFavoriteTags = function(req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            message: 'UnauthorizedError: Private profile.'
        });
        return;
    }

    var date = new Date();
    var yesterday = new Date(date.getTime());
    yesterday.setDate(date.getDate() - 1);

    var end = new Date();
    end.setHours(23, 59, 59, 999);

    Event.aggregate([{
        "$match": {
            "$and": [{ 'timeStamp': { '$gte': yesterday, '$lt': end } }, {
                "$or": [{ 'type': { "$in": ['note_update', 'note_open', 'note_pin', 'note_copy', 'note_create', 'note_share', 'tag_add', 'tag_remove', 'tag_open'] } },
                    { 'data.contributors': { "$in": [req.payload._id] } }, { 'data.public': 'true' }, { 'data.isTrashed': 'false' }
                ]
            }]
        }
    },
        { '$unwind': '$data.tags' },
        { '$group': { "_id": { 'label': '$data.tags' }, 'data': { '$sum': 1 } } },
        { '$limit': 5 }
    ]).exec(function(err, data) {
        if (err) {
            res.status(401).json(err);
        } else {
            console.log(data);
            res.status(200).json(data);
        }
    });

}

router.post('/signup', signUp);
router.post('/login', logIn);

router.post('/event', auth, postEvent);

router.get('/getuser', auth, getUser);
router.get('/getusers', auth, getUsers);
router.put('/updateuser', auth, updateUser);

router.get('/getusertags', auth, getUserTags);
router.get('/addtag/:tag', auth, addTag);
router.delete('/deletetag/:tag', auth, deleteTag);

router.get('/getnotes', auth, getNotes);
router.post('/addnote', auth, addNote);
router.put('/updatenote', auth, updateNote);
router.delete('/deletenote/:id', auth, deleteNote);

router.get('/getusergroups', auth, getUserGroups);
router.get('/getallgroups', auth, getAllGroups);
router.put('/joingroup', auth, joinGroup);
router.put('/leavegroup', auth, leaveGroup);

router.get('/usage', auth, getUsageData);
router.get('/favoritetags', auth, getFavoriteTags);

module.exports = router;
