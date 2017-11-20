angular.module('Ultiprep').controller('NotesIndexController', function(Note, $scope) {
    $scope.notes = Note.query();
    $scope.search = {};
});
