"use strict";
var APP = APP || {
  movies: function () {
    console.log("in show_movie_page");
  },
  collections: {},
  collection_years: {},

  play: function(item_id, files, top_level_collection_name) {
    var player = new Player;
    var playlist = new Playlist();
    var files_to_play = [];
    var stop = false;
    var media_type = (top_level_collection_name == "movies") ? "video" : "audio";
    files.map(function (file) {
      if (!stop) {
	if ("movies" == top_level_collection_name) {
	  if (file.name.endsWith(".mp4")) {
	    files_to_play.push(file);
	    // break; damn javascript, can't do break in map
	    stop = true;
	  }
	} else if ("etree" == top_level_collection_name) {
	  if (file.name.endsWith(".mp3")) {
	    files_to_play.push(file);
	  }
	}
      }
    });
    files_to_play.sort(function (file_a, file_b) {
      return parseInt(file_a.track) - parseInt(file_b.track);
    }).map(function (file) {
      var item = new MediaItem(media_type, "https://archive.org/download/" + item_id + "/" + encodeURI(file.name));
      item.title = file.title;
      item.subtitle = file.album;
      item.artworkImageURL = "https://archive.org/services/get-item-image.php?identifier=" + item_id;
      playlist.push(item);
    });
    player.playlist = playlist;
    player.play();
  },

  show_collection_years: function (event, top_level_collection_name) {
    var self = this;
    var item_id = event.target.getAttribute("ia_ID")
    var doc = Forms.make_doc(Forms.showcase_template);
    var section = doc.getElementById("section");
    section.addEventListener("select", function (event) {
      self.play_item.call(self, event, top_level_collection_name);
    });
    Forms.push(doc);
    var sorted_items = self.collection_years[item_id].sort(function (item_a, item_b) {
      return parseInt(item_b.week) - parseInt(item_a.week);
    });
    doc.getElementById("title").innerHTML = item_id; // could use the title from the first item combined with the year
    sorted_items.map(function (item) {
      Forms.insert_lockup(doc, section, item.identifier, item.title);
    });
  },

  play_item: function (event, top_level_collection_name) {
    var self = this;
    var item_id = event.target.getAttribute("ia_ID")
    self.ia.get_metadata(item_id, function (metadata) {
      self.play(item_id, metadata.files, top_level_collection_name);
    });
  },

  show_catalog: function (ia_collection_id, collection_name) {
    var self = this;
    var collection_item = this.collections[ia_collection_id];
    var doc = Forms.make_doc(Forms.showcase_template);
    doc.getElementById("title").innerHTML = collection_item["title"];
    Forms.push(doc);
    var section = doc.getElementById("section");
    section.addEventListener("select", function (event) {
      self.show_collection_years.call(self, event, collection_name);
    });
    this.ia.get_collections(ia_collection_id, collection_name, undefined, function (collection_name, data) {
      var collections_for_years = {}
      data.map(function (ia_item) {
	self.collections[ia_item.identifier] = ia_item;
	if (!ia_item.year) {
	  ia_item.year = "Undated";
	}
	var collection_with_year = ia_collection_id + ":" + ia_item.year;
	collections_for_years[ia_item.year] = 1;
	if (!self.collection_years[collection_with_year]) {
	  self.collection_years[collection_with_year] = [];
	}
	(self.collection_years[collection_with_year]).push(ia_item);
      });
      Object.keys(collections_for_years).sort(function (a, b) {
	return parseInt(b) - parseInt(a);
      }).map(function (year) {
	var collection_with_year = ia_collection_id + ":" + year;
	Forms.insert_lockup(doc, section, collection_with_year, year + " (" + self.collection_years[collection_with_year].length + ")", ia_collection_id);
      });
      // console.log("index: " + index.toString() + ", identifier: " + ia_item.identifier + ", title: " + ia_item.title);
    });
  },
  process_collection: function (collection_name, collections, form_doc) {
    var self = this;
    var section = form_doc.getElementById('section');
    var title = form_doc.getElementById('title');
    for (var id in collections) {
      var collection = collections[id];
      self.collections[collection["identifier"]] = collection;
      Forms.insert_lockup(form_doc, section, collection["identifier"], collection["title"] + " (" + collection["downloads"] + ")");
    }
    form_doc.getElementById("section").addEventListener("highlight", function (event) {
      title.innerHTML = collection_name + " (" + event.target.getAttribute("ia_ID") + ")";
    });
	  
    form_doc.getElementById("section").addEventListener("select", function (event) {
      self.show_catalog(event.target.getAttribute("ia_ID"), collection_name);
      console.log("got subcollection");
    });
    console.log("got " + collection_name + " collection");
  },

  // setup_search_form: function(form_doc) {
  //   var self = this;
  //   var keyboard = form_doc.getElementById('search').getFeature('Keyboard')

  //   var movie_section = form_doc.getElementById("movie_results");
  //   var music_section = form_doc.getElementById("music_results");

  //   music_section.addEventListener("select", function(event){
  //     self.play_item(event, "etree");
  //   });
  //   movie_section.addEventListener("select", function(event){
  //     self.play_item(event, "movies");
  //   });

  //   keyboard.onTextChange = function () {
  //     // console.log( "keyboard.text );
  //     var search_options = {
  //       "rows" : "50",
  //       "fl[]" : "identifier,title,downloads,mediatype",
  //       "sort[]" : "downloads+desc"
  //     };
  //     APP.ia.search(keyboard.text+" AND mediatype:(etree OR movies)", search_options,
  //       function success(ia_data) {
  //         // got search results
  //         var docs = ia_data.response.docs;
  //         // clear old results
  //         Forms.remove_all_child_nodes(movie_section);
  //         Forms.remove_all_child_nodes(music_section);
  //         // insert new results
  //         docs.map(function shelf_insert(item) {
  //           console.log(item);
  //           var section = item.mediatype == 'movies' ? movie_section : music_section;
  //           Forms.insert_lockup(form_doc, section, item.identifier, item.title);
  //         });
  //       }, function failure() {
  //         // TODO: handle search error
  //       });
  //   }
  // }
}

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/lib.js`,
    `${options.BASEURL}js/forms.js`,
  ];
  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      // lib should be loaded by now
      APP.ia = new IA(options);
      var menu_page = MenuPage.create({name: "Menu"});
      Forms.push(menu_page.doc);

      // APP.setup_search_form(APP.search_doc);
      
      console.log("launched with success");
    } else
      console.log("launched with failure");
  });
};



