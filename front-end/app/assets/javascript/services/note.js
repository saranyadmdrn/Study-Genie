angular.module('Ultiprep').factory('Note', function($resource){
  return $resource('/notes/:id', {id: "@id"}, {
    update: {
      method: "PUT"
    }
  });
});