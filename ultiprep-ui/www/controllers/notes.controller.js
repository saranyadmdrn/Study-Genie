var app = angular.module('ultiprep');

app.controller('notesController', function($scope, $state, authentication, data) {

    $scope.colorClasses = [
        'color1', 'color2', 'color3', 'color4', 'color5', 'color6', 'color7', 'color8', 'color9', 'color10'
    ];

    $scope.tags = [];
    $scope.selectedTags = [];

    $scope.notes = [];

    $scope.note = {
        title: '',
        content: '',
        dateCreated: '',
        tags: [],
        colorClass: '',
        isPinned: {}
        ,
        isTrashed: false,
        timestamp: 0,
        author: ''
    };

    $scope.currentNote = null;
    $scope.titleMaxLength = 100;
    $scope.tagMaxLength = 20;
    $scope.someNotes = [];

    $scope.userGroups = {};

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
        .success(function(data) {
            $scope.currentUser = data;
            $scope.note.isPinned[$scope.currentUser._id] = false;
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

    data.getNotes()
        .success(function(data) {
            $scope.notes = data.sort(reverseCompareTimestamps);
            resetSomeNotes();
        })
        .error(function(err) {
            alertToast('An error occurred while loading notes. ' + err.message);
        });

    data.getUserGroups()
        .success(function(data) {
            $scope.userGroups = data;
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

    $scope.duplicateNote = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        var newNote = {};

        newNote.title = note.title;
        newNote.content = note.content;
        newNote.dateCreated = getCurrentDate();
        newNote.tags = note.tags.slice();
        newNote.colorClass = note.colorClass;
        newNote.isPinned = {};
        newNote.isPinned[$scope.currentUser._id] = note.isPinned[$scope.currentUser._id] || false;
        newNote.isTrashed = note.isTrashed;
        newNote.timestamp = Math.floor(Date.now() / 1000);

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
        $scope.apply();
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
        $scope.apply();
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

        note.isTrashed = true;
        data.updateNote(note);
        data.postEvent(newEvent('note_trash', note)).success(function() {}).error(function (err) {});
    };

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

        note.isTrashed = false;
        data.updateNote(note);
        data.postEvent(newEvent('note_untrash', note)).success(function() {}).error(function (err) {});
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
        newNote.colorClass = $scope.colorClasses[8];
        newNote.isPinned = {};
        newNote.isPinned[$scope.currentUser._id] = false;
        newNote.isTrashed = false;
        newNote.timestamp = Math.floor(Date.now() / 1000);

        $scope.notes.unshift(newNote);
        data.addNote(newNote);

        setTimeout(function() {
            data.getNotes()
                .success(function(data) {
                    $scope.notes = data.sort(reverseCompareTimestamps);
                    resetSomeNotes();

                    setTimeout(function() {
                        $('#note-edit-modal-0').modal('show');
                        $scope.currentNote = $scope.someNotes[0];
                    }, 30);

                    data.postEvent(newEvent('note_create', $scope.notes[0])).success(function() {}).error(function (err) {});
                })
                .error(function(err) {
                    alertToast('Could not delete note. ' + err.message);
                });
        }, 300);
    };

    $scope.setNoteColor = function(note, colorClass) {

        if (note === null || colorClass === null || typeof note !== 'object' || typeof colorClass !== 'string')
            return;

        note.colorClass = colorClass;
        data.updateNote(note);
        data.postEvent(newEvent('note_update', note)).success(function() {}).error(function (err) {});
    };

    $scope.checkNoteTag = function(note, tag) {
        return note.tags.indexOf(tag) != -1;
    };

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
    };

    $scope.setCurrentNote = function(note) {
        alert();
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
        event.timeStamp = Math.floor(Date.now() / 1000) + 0;

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

});
