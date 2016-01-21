var APP = APP || {
  movies: function () {
    console.log("in show_movie_page");
  },
  collections: {}
};

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/lib.js`,
    `${options.BASEURL}js/forms.js`,
  ];
  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      //Forms.push(Forms.make_doc(Forms.tmp_template));
      //return;
      Forms.make_menu();
      var ia = new IA(options);
      ia.get_collections("movies", "collection", undefined, function (movie_collections) {
	var section = APP.movies_doc.getElementById('section');
	for (var id in movie_collections) {
	  var collection = movie_collections[id];
	  APP.collections[collection["identifier"]] = collection;
	  Forms.insert_lockup(APP.movies_doc, section, collection["identifier"], collection["title"]);
	}
	Forms.push(APP.movies_doc);
	APP.movies_doc.getElementById("section").addEventListener("select", function (event) {
	  ia.get_collections(event.target.getAttribute("ia_ID"), "movies", undefined, function (data) {
	    console.log("got subcollection");
	  });
	});
	console.log("got movie collection");
      }, function (ia_data) {
	console.log("didn't get movie collection");
      });
      console.log("launched with success");
    } else
      console.log("launched with failure");
  });
};



