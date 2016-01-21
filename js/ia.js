var APP = APP || {
  movies: function () {
    console.log("in show_movie_page");
  },
  collections: {},

  play: function(url) {
    var player = new Player;
    var playlist = new Playlist();
    playlist.push(new MediaItem("video", url));
    player.playlist = playlist;
    player.play();
  },

  show_catalog: function (ia_collection_id) {
    var self = this;
    var collection_item = this.collections[ia_collection_id];
    var doc = Forms.make_doc(Forms.showcase_template);
    doc.getElementById("title").innerHTML = collection_item["title"];
    Forms.push(doc);
    var section = doc.getElementById("section");
    section.addEventListener("select", function (event) {
      var item_id = event.target.getAttribute("ia_ID")
      self.ia.get_metadata(item_id, function (metadata) {
	var mp4_file;
	for (var index in metadata.files) {
	  var name = metadata.files[index].name;
	  if (name.endsWith(".mp4")) {
	    mp4_file = "https://archive.org/download/" + item_id + "/" + name;
	  }
	}
	if (mp4_file) {
	  self.play(mp4_file);
	}
	else {
	  console.log("can't find mp4 in metadata");
	}
      });
    });
    this.ia.get_collections(ia_collection_id, "movies", undefined, function (data) {
      for (var index in data) {
	ia_item = data[index];
	self.collections[ia_item.identifier] = ia_item;
	Forms.insert_lockup(doc, section, ia_item.identifier, ia_item.title);
	console.log("index: " + index.toString() + ", identifier: " + ia_item.identifier + ", title: " + ia_item.title);
      }
    });
  }
};

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/lib.js`,
    `${options.BASEURL}js/forms.js`,
  ];
  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      //Forms.push(Forms.make_doc(Forms.tmp1_template));
      //return;
      Forms.make_menu();
      Forms.push(APP.movies_doc);
      APP.ia = new IA(options);
      APP.ia.get_collections("movies", "collection", undefined, function (movie_collections) {
	var section = APP.movies_doc.getElementById('section');
	var title = APP.movies_doc.getElementById('title');
	for (var id in movie_collections) {
	  var collection = movie_collections[id];
	  APP.collections[collection["identifier"]] = collection;
	  Forms.insert_lockup(APP.movies_doc, section, collection["identifier"], collection["title"]);
	}
	APP.movies_doc.getElementById("section").addEventListener("highlight", function (event) {
	  title.innerHTML = "Movies (" + event.target.getAttribute("ia_ID") + ")";
	});
								  
	APP.movies_doc.getElementById("section").addEventListener("select", function (event) {
	  APP.show_catalog(event.target.getAttribute("ia_ID"));
	  console.log("got subcollection");
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



