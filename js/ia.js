var APP = APP || {};

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/lib.js`,
    `${options.BASEURL}js/forms.js`,
  ];
  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      APP.top_doc = Forms.make_doc(Forms.main(), function (event) {
	console.log("callback");
      });
      navigationDocument.pushDocument(APP.top_doc);
      var ia = new IA(options);
      ia.get_sub_collections("movies", undefined, function (movie_collection) {
	console.log("got movie collection");
      }, function (ia_data) {
	console.log("didn't get movie collection");
      });
      console.log("launched with success");
    } else
      console.log("launched with failure");
  });
};



