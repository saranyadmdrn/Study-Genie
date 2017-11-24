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
        isPinned: false,
        isTrashed: false,
        timestamp: 0,
        author: ''
    };

    $scope.currentNote = null;
    $scope.titleMaxLength = 100;
    $scope.tagMaxLength = 20;

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
        })
        .error(function(err) {
            alertToast('An error occurred while loading notes. ' + err.message);
        });

    $scope.duplicateNote = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        var newNote = {};

        newNote.title = note.title;
        newNote.content = note.content;
        newNote.dateCreated = getCurrentDate();
        newNote.tags = note.tags.slice();
        newNote.colorClass = note.colorClass;
        newNote.isPinned = note.isPinned;
        newNote.isTrashed = note.isTrashed;
        newNote.timestamp = Math.floor(Date.now() / 1000);

        $scope.notes.unshift(newNote);

        data.addNote(newNote);

        setTimeout(function() {
            data.getNotes()
                .success(function(data) {
                    $scope.notes = data.sort(reverseCompareTimestamps);
                })
                .error(function(err) {
                    alertToast('An error occurred while loading notes. ' + err.message);
                });
        }, 300);

    };

    $scope.pinNote = function(note) {

        if (note === null || typeof note !== 'object')
            return;

        note.isPinned = true;
        data.updateNote(note);
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

        note.isPinned = false;
        data.updateNote(note);
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

        var index = $scope.notes.indexOf(note);

        $scope.notes.splice(index, 1);
        data.removeNote(note);
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
        newNote.isPinned = false;
        newNote.isTrashed = false;
        newNote.timestamp = Math.floor(Date.now() / 1000);

        //$scope.notes.unshift(newNote);
        data.addNote(newNote);

        setTimeout(function() {
            data.getNotes()
                .success(function(data) {
                    $scope.notes = data.sort(reverseCompareTimestamps);

                    setTimeout(function() {
                        $('#note-edit-modal-0').modal('show');
                        $scope.currentNote = $scope.notes[0];
                    }, 30);
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
            }
        }

        var index = $scope.tags.indexOf(tag);

        $scope.tags.splice(index, 1);
        data.removeTag(tag);
    };

    $scope.setSelectedTags = function(arr) {
        $scope.selectedTags = arr;
    };

    $scope.setCurrentNote = function(note) {
        if (note === null || typeof note !== 'object')
            return;

        $scope.currentNote = note;
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
