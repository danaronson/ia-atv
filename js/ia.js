var APP = APP || {};

App.onLaunch = function(options) {
  var javascriptFiles = [
    `${options.BASEURL}js/lib.js`,
  ];
  evaluateScripts(javascriptFiles, function(success) {
    if (success) {
      var ia = new IA(options);
      ia.search("collection:(movies) AND mediatype:collection", {"output" : "json"},
		function (ia_data) {
		  console.log("success");
		},
		function (request) {
		  console.log("failure");
		}
		);
      console.log("launched with success");
    } else
      console.log("launched with failure");
  });
};



