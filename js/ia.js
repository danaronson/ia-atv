"use strict";
var APP = APP || {
  // movies: function () {
  //   console.log("in show_movie_page");
  // },
  // collections: {},
  // collection_years: {},

  play: function(item_id, files, top_level_collection_name) {

    console.log("play",item_id, files, top_level_collection_name);

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

  play_item: function (event, top_level_collection_name) {
    var self = this;
    var item_id = event.target.getAttribute("ia_ID")
    self.ia.get_metadata(item_id, function (metadata) {
      self.play(item_id, metadata.files, top_level_collection_name);
    });
  },

}

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/lib.js`,
    `${options.BASEURL}js/forms.js`,
  ];
  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      APP.ia = new IA(options);

      var menu_page = MenuPage.create({name: "Menu"});
      menu_page.push();

      console.log("launched with success");
    } else
      console.log("launched with failure");
  });
};



