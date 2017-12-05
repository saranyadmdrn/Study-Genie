var app = angular.module('ultiprep');

app.controller('notesController', ["$scope", "$state", "authentication", "data", function($scope, $state, authentication, data) {

    $scope.tags = [];
    $scope.selectedTags = [];

    $scope.notes = [];

    $scope.note = {
        title: '',
        content: '',
        dateCreated: '',
        tags: [],
        isPinned: {}
        ,
        isTrashed: {},
        timestamp: new Date(),
        author: ''
    };

    $scope.currentNote = null;
    $scope.titleMaxLength = 100;
    $scope.tagMaxLength = 20;
    $scope.someNotes = [];

    $scope.userGroups = {};

    $scope.groups = [];

    $scope.users = [];

    $scope.froalaOptions = {
        heightMin: 300,
        heightMax: 375,
        zIndex: 9000,
        multiLine: true,
        placeholderText: 'Take a note...',
        charCounterCount: false,
        toolbarInline: false,
        toolbarButtons: ['bold', 'italic', 'underline', '|', 'align', 'formatOL', 'formatUL', '|', 'color', 'emoticons', 'insertLink', 'insertImage', 'insertFile', 'html'],
        toolbarButtonsMD: ['bold', 'italic', 'underline', '|', 'align', 'formatOL', 'formatUL', '|', 'color', 'emoticons', 'insertLink', 'insertImage', 'insertFile', 'html'],
        toolbarButtonsSM: ['bold', 'italic', 'underline', '|', 'align', 'formatOL', 'formatUL', '|', 'color', 'emoticons', 'insertLink', 'insertImage', 'insertFile', 'html'],
        toolbarButtonsXS: ['bold', 'italic', 'underline', '|', 'align', 'formatOL', 'formatUL', '|', 'color', 'emoticons', 'insertLink', 'insertImage', 'insertFile', 'html'],
        tooltips: true,
        spellcheck: true,
        tabSpaces: 4,
        theme: 'gray',
        immediateAngularModelUpdate: true,
    };

    $scope.currentUser = {};
    $scope.isLoggedIn = authentication.isLoggedIn();

    data.getUser()
        .success(function(userData) {
            $scope.currentUser = userData;
            $scope.note.isPinned[$scope.currentUser._id] = false;

            data.getRecommendedNotes($scope.currentUser._id)
                .success(function(data) {
                    $scope.notes = data;
                    resetSomeNotes();
                })
                .error(function(err) {
                    alertToast('An error occurred while loading notes. ' + err.message);
                });
        })
        .error(function(err) {
            alertToast('An error occurred while loading user details. ' + err.message);
            if (err.message.indexOf('not found') !== -1)
                $scope.logout();
        });

    data.getUserTags()
        .success(function(data) {
            $scope.tags = data.tags;
        })
        .error(function(err) {
            alertToast('An error occurred while loading tags. ' + err.message);
        });

    // data.getNotes()
    //     .success(function(data) {
    //         $scope.notes = data.sort(reverseCompareTimestamps);
    //         resetSomeNotes();
    //     })
    //     .error(function(err) {
    //         alertToast('An error occurred while loading notes. ' + err.message);
    //     });

    data.getUserGroups()
        .success(function(data) {
            $scope.userGroups = data;
            console.log($scope.userGroups);
        })
        .error(function(err){
            alertToast('An error occurred while loading groups. ' + err.message);
        });

    data.getAllGroups()
        .success(function(data) {
            $scope.groups = data;
            console.log($scope.groups);
        })
        .error(function(err){
            alertToast('An error occurred while loading groups. ' + err.message);
        });

    data.getAllUsers()
        .success(function(data) {
            $scope.users = data;
            console.log($scope.users);
        })
        .error(function(err){
            alertToast('An error occurred while loading groups. ' + err.message);
        });

    function resetSomeNotes() {
        $scope.someNotes = [];
        // for (var i = 0; i < ($scope.notes.length > 10 ? 10 : $scope.notes.length); i++) {
            for (var i = 0; i < $scope.notes.length; i++) {
            $scope.someNotes.push($scope.notes[i]);
        }
    }

    $scope.onClick = function(note, $index) {
        data.postEvent(newEvent('note_open', note)).success(function() {}).error(function (err) {});
    }

    $scope.duplicateNote = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        var newNote = {};

        newNote.title = note.title;
        newNote.author = $scope.currentUser._id;
        newNote.content = note.content;
        newNote.dateCreated = getCurrentDate();
        newNote.tags = note.tags.slice();
        newNote.isPinned = {};
        newNote.isPinned[$scope.currentUser._id] = note.isPinned[$scope.currentUser._id] || false;
        newNote.isTrashed = {};
        newNote.isTrashed[$scope.currentUser._id] = note.isTrashed[$scope.currentUser._id] || false;
        newNote.timestamp = new Date();

        $scope.someNotes.unshift(newNote);

        data.addNote(newNote);

        setTimeout(function() {
            data.getNotes()
                .success(function(data) {
                    $scope.notes = data.sort(reverseCompareTimestamps);
                    resetSomeNotes();
                    data.postEvent(newEvent('note_copy', $scope.notes[0])).success(function() {}).error(function (err) {});
                })
                .error(function(err) {
                    alertToast('An error occurred while loading notes. ' + err.message);
                });
        }, 300);

    };

    $scope.loadMore = function() {
        var last = $scope.someNotes.length;
        // for (var i = last; (last + i) < (last + $scope.notes.length > 10) ? (last + 10) : (last + $scope.notes.length); i++) {
        //     $scope.someNotes.push($scope.notes[i]);
        // }
    }

    $scope.pinNote = function(note) {

        if (note === null || typeof note !== 'object')
            return;
        note.isPinned[$scope.currentUser._id] = true;
        data.updateNote(note);
        data.postEvent(newEvent('note_pin', note)).success(function() {}).error(function (err) {});
        // $scope.apply();
    };

    $scope.pinNoteViaModal = function(note, $index) {

        $('#note-view-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.pinNote(note);
            $scope.$apply();
        });

        $('#note-edit-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.pinNote(note);
            $scope.$apply();
        });
    };

    $scope.unpinNote = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        note.isPinned[$scope.currentUser._id] = false;
        data.updateNote(note);
        data.postEvent(newEvent('note_unpin', note)).success(function() {}).error(function (err) {});
        // $scope.$apply();
    };

    $scope.unpinNoteViaModal = function(note, $index) {

        $('#note-view-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.unpinNote(note);
            $scope.$apply();
        });

        $('#note-edit-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.unpinNote(note);
            $scope.$apply();
        });
    };

    $scope.moveNoteToTrash = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        note.isTrashed[$scope.currentUser._id] = true;
        data.updateNote(note);
        data.postEvent(newEvent('note_trash', note)).success(function() {}).error(function (err) {});
        //$scope.$apply();
    };

    $scope.isAuthor = function (note) {
        if (note.author == $scope.currentUser._id) {
            return true;
        }
        return false;
    }

    $scope.moveNoteToTrashViaModal = function(note, $index) {

        $('#note-view-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.moveNoteToTrash(note);
            $scope.$apply();
        });

        $('#note-edit-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.moveNoteToTrash(note);
            $scope.$apply();
        });
    };

    $scope.removeNoteFromTrash = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        note.isTrashed[$scope.currentUser._id] = false;
        data.updateNote(note);
        data.postEvent(newEvent('note_untrash', note)).success(function() {}).error(function (err) {});
        //$scope.$apply();
    };

    $scope.removeNoteFromTrashViaModal = function(note, $index) {

        $('#note-view-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.removeNoteFromTrash(note);
            $scope.$apply();
        });

        $('#note-edit-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.removeNoteFromTrash(note);
            $scope.$apply();
        });
    };

    $scope.deleteNotePermanently = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        var someNotesIndex = $scope.someNotes.indexOf(note);

        $scope.someNotes.splice(someNotesIndex, 1);

        var index = $scope.notes.indexOf(note);

        $scope.notes.splice(index, 1);
        data.removeNote(note);
        data.postEvent(newEvent('note_delete', note)).success(function() {}).error(function (err) {});
        $scope.apply();
    };

    $scope.deleteNotePermanentlyViaModal = function(note, $index) {

        $('#note-view-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.permanentlyRemoveNote(note);
            $scope.$apply();
        });

        $('#note-edit-modal-' + $index).on('hidden.bs.modal', function() {
            $scope.permanentlyRemoveNote(note);
            $scope.$apply();
        });
    };

    $scope.createNote = function() {

        $scope.searchString = '';
        $state.go('notes.state-notes');

        var newNote = {};

        newNote.title = '';
        newNote.content = '';
        newNote.dateCreated = getCurrentDate();
        newNote.tags = [];
        newNote.isPinned = {};
        newNote.isPinned[$scope.currentUser._id] = true;
        newNote.isTrashed = {};
        newNote.isTrashed[$scope.currentUser._id] = false;
        newNote.timestamp = new Date();
        newNote.contributors = [];
        newNote.author = $scope.currentUser._id;

        $scope.notes.unshift(newNote);
        data.addNote(newNote);

        setTimeout(function() {
            data.getNotes()
                .success(function(newData) {
                    $scope.notes = newData.sort(reverseCompareTimestamps);
                    resetSomeNotes();
                    console.log($scope.notes[0]);
                    $scope.currentNote = $scope.notes[0];
                    setTimeout(function() {
                        $('#note-edit-modal-0').modal('show');
                    }, 30);

                    data.postEvent(newEvent('note_create', $scope.notes[0])).success(function() {}).error(function (err) {});
                })
                .error(function(err) {
                    alertToast('Could not delete note. ' + err.message);
                });
        }, 300);
    };

    $scope.checkNoteTag = function(note, tag) {
        return note.tags.indexOf(tag) != -1;
    };

    $scope.checkGroupMember = function(group, member) {
        return group.members.indexOf(member) != -1;
    };

    $scope.checkUserAccess = function(note, member) {
        return note.contributors.indexOf(member) != -1;
    };

    $scope.isMember = function(group) {
        return $scope.checkGroupMember(group, $scope.currentUser._id);
    }

    $scope.getGroupClass = function(group) {
        if ($scope.isMember(group)) {
            return 'member';
        }
        return 'non-member';
    }

    $scope.joinGroup = function(group) {
        if (group.members.indexOf($scope.currentUser._id) < 0) {
            group.members.push($scope.currentUser._id);
            data.joinGroup(group);
        }
    }

    $scope.leaveGroup = function(group) {
        if (group.members.indexOf($scope.currentUser._id) > -1) {
            group.members.splice(group.members.indexOf($scope.currentUser._id));
            data.leaveGroup(group);
        }
    }

    $scope.changeNoteTag = function(note, tag) {

        if (note === null || tag === null || typeof note !== 'object' || typeof tag !== 'string')
            return;

        var index = note.tags.indexOf(tag);

        if (index == -1)
            note.tags.push(tag);
        else
            note.tags.splice(index, 1);

        data.updateNote(note);
        data.postEvent(newEvent('note_update', note)).success(function() {}).error(function (err) {});
    };

    $scope.changeUserAccess = function(note, member) {

        if (note === null || member === null || typeof note !== 'object' || typeof member !== 'string')
            return;

        var index = note.contributors.indexOf(member);

        if (index == -1)
            note.contributors.push(member);
        else
            note.contributors.splice(index, 1);

        data.updateNote(note);
        data.postEvent(newEvent('note_update', note)).success(function() {}).error(function (err) {});
    };

    $scope.changeNoteTagViaTagsPage = function(note, tag, $index) {

        if (note === null || tag === null || typeof note !== 'object' || typeof tag !== 'string')
            return;

        var index = note.tags.indexOf(tag);
        if (index == -1)
            note.tags.push(tag);
        else {
            if ($scope.selectedTags.indexOf(tag) == -1)
                note.tags.splice(index, 1);
            else {
                $('#note-edit-modal-' + $index).on('hidden.bs.modal', function() {
                    note.tags.splice(index, 1);
                    $scope.$apply();
                });
                $('#note-edit-modal-' + $index).modal('hide');
            }
        }

        data.updateNote(note);
        data.postEvent(newEvent('note_update', note)).success(function() {}).error(function (err) {});
    };

    $scope.addTag = function(newTag) {

        $('#add-tag-form input').val('');

        if (newTag === null || typeof newTag !== 'string')
            return;

        for (var i = 0; i < $scope.tags.length; i++) {
            if (newTag.toLowerCase() == $scope.tags[i].toLowerCase()) {
                alertToast('Tag already exists.');
                return;
            }
        }

        $scope.tags.push(newTag);
        setRippleEffects();
        data.addTag(newTag);
        data.postEvent(newEvent('tag_add', newTag)).success(function() {}).error(function (err) {});
    };

    $scope.removeTag = function(tag) {

        if (tag === null || typeof tag !== 'string')
            return;

        for (var i = 0; i < $scope.notes.length; i++) {
            if (typeof $scope.notes[i].tags === 'undefined')
                continue;

            var index = $scope.notes[i].tags.indexOf(tag);
            if (index != -1) {
                $scope.notes[i].tags.splice(index, 1);
                data.updateNote($scope.notes[i]);
                data.postEvent(newEvent('note_update', $scope.notes[i])).success(function() {}).error(function (err) {});
            }
        }

        for (var i = 0; i < $scope.someNotes.length; i++) {
            if (typeof $scope.notes[i].tags === 'undefined')
                continue;

            var index = $scope.someNotes[i].tags.indexOf(tag);
            if (index != -1) {
                $scope.someNotes[i].tags.splice(index, 1);
            }
        }

        var index = $scope.tags.indexOf(tag);

        $scope.tags.splice(index, 1);
        data.removeTag(tag);
        data.postEvent(newEvent('tag_remove', newTag)).success(function() {}).error(function (err) {});
    };

    $scope.setSelectedTags = function(arr) {
        $scope.selectedTags = arr;
        data.postEvent(newEvent('tag_open', arr[0])).success(function() {}).error(function (err) {});
    };

    $scope.setCurrentNote = function(note) {
        if (note === null || typeof note !== 'object')
            return;

        $scope.currentNote = note;
        data.postEvent(newEvent('note_open', $scope.currentNote)).success(function() {}).error(function (err) {});
    };

    $scope.openEditModalViaViewModal = function(note, $index) {
        $('#note-view-modal-' + $index).modal('hide');
        $('#note-edit-modal-' + $index).modal('show');
        $scope.currentNote = note;
    };

    $scope.setEditModalCloseToResetCurrentNote = function() {
        $('.note-edit-modal').off('hidden.bs.modal');
        $('.note-edit-modal').on('hidden.bs.modal', function() {

            data.updateNote($scope.currentNote);
            data.postEvent(newEvent('note_update', $scope.currentNote)).success(function() {}).error(function (err) {});
            $scope.currentNote = null;
        });
    };

    $scope.isSelf = function(member) {
        console.log(member);
        if (member == $scope.currentUser._id) {

            return true;
        }
        return false;
    }

    $scope.shareNote = function(note, $index) {

    }

    $scope.logNotes = function() {
        console.log($scope.notes);
    };

    $scope.logout = function() {
        authentication.logOut();
        $state.go('landing');
    };

    var newEvent = function(type, data) {
        var event = {};
        event.type = type;
        event.data = data;
        event.dateCreated = getCurrentDate();
        event.timeStamp = new Date();

        return event;
    };

    var getCurrentDate = function() {

        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var d = new Date();
        return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    };

    var ngRepFinCounter = 0;
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {

        ngRepFinCounter++;
        console.log('ngRepeatFinished ' + ngRepFinCounter);

        if ($scope.currentNote != null && ngRepFinCounter >= 10 /* 5 */ ) {
            data.updateNoteContent($scope.currentNote);
            ngRepFinCounter = 0;
        }
        textareaAutoResizer();
        $scope.setEditModalCloseToResetCurrentNote();
        setLayout(5);
    });

}]);
