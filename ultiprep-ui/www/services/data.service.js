var app = angular.module('ultiprep');

app.service('data', function($http, authentication) {

    var getUser = function() {
        return $http.get('/api/getuser', {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var updateUser = function(user) {
        return $http.put('/api/updateuser', user, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var changeUserPassword = function(changePassword) {
        return $http.put('/api/changeuserpassword', changePassword, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var removeUser = function(password) {
        return $http.delete('/api/deleteuser/' + password, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var getUserTags = function() {
        return $http.get('/api/getusertags', {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var addTag = function(tag) {
        return $http.get('/api/addtag/' + tag, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var removeTag = function(tag) {
        return $http.delete('/api/deletetag/' + tag, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var getNotes = function() {
        return $http.get('/api/getnotes', {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var addNote = function(note) {
        return $http.post('/api/addnote', note, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var updateNote = function(note) {
        return $http.put('/api/updatenote', note, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var updateNoteContent = function(note) {
        return $http.put('/api/updatenote', note, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            },
            ignoreLoadingBar: true
        });
    };

    var removeNote = function(note) {
        return $http.delete('/api/deletenote/' + note._id, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    };

    var postEvent = function(eventObj) {
        return $http.post('/api/event/', eventObj, {
            headers: {
                Authorization: 'Bearer ' + authentication.getToken()
            }
        });
    }

    return {
        getUser: getUser,
        updateUser: updateUser,
        changeUserPassword: changeUserPassword,
        removeUser: removeUser,
        getUserTags: getUserTags,
        addTag: addTag,
        removeTag: removeTag,
        getNotes: getNotes,
        addNote: addNote,
        updateNote: updateNote,
        updateNoteContent: updateNoteContent,
        removeNote: removeNote,
        postEvent: postEvent
    };
});
