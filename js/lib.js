function IA(options) {
  this.APIURL = options.APIURL;
}

IA.prototype.search = function(query_string, search_options, success_callback, failure_callback) {
  var self = this;
  var request = new XMLHttpRequest();
  var option_string = "&output=json";
  var now = Date.now();
  for (var key in search_options) {
    option_string += "&" + key + "=" + search_options[key];
  }
  request.responseType = "application/json";
  var request_string = this.APIURL + "advancedsearch.php?q=" + query_string + option_string;
  request_string = encodeURI(request_string);
  request.addEventListener("load", function() {
    console.log("request took " + (Date.now() - now) + " milliseconds");
    if (200 != request.status) {
      console.log("failure for: " + request_string);
      failure_callback.call(self, request);
    } else {
      console.log("success for: " + request_string);
      success_callback.call(self, JSON.parse(request.response));
    }
  });
  request.addEventListener("error", function (error) {
    console.log("failure for: " + request_string);
    failure_callback.call(self, request, error);
  });
  request.addEventListener("timeout", function () {
    console.log("timeout");
  });

  console.log("about to request: " + request_string);
  request.open("GET", request_string);
  request.setRequestHeader("Content-Type", "application/json")
  request.setRequestHeader("Accept", "application/json")
  request.send();
}

IA.prototype.get_collections = function(collection_name, result_type, num, success_function, failure_function) {
  if (!failure_function) {
    failure_function = function (collection_name, collection_data) {
      console.log("Error while trying to get collection for: " + collection_name);
    }
  }
  var options = {"rows" : "1", "fl[]" : "identifier,title,year,downloads,week"}
  if (num) {

    options["rows"] = num.toString();
    // options["rows"] = "100"; FOR TESTING
  }
  this.search("collection:(" + collection_name + ") AND mediatype:" + result_type, options,
	      function (ia_data) {
		if (0 == ia_data.responseHeader.status) {
		  if (!num) {
		    // hopefully there are more than 0 items, if not it's an error
		    if (0 == ia_data.response.numFound) {
		      failure_function.call(this, collection_name, ia_data);
		    } else {
		      this.get_collections(collection_name, result_type, ia_data.response.numFound, success_function, failure_function);
		    }
		  } else {
		    if (num == ia_data.response.numFound) {
		      success_function.call(this, collection_name, ia_data.response.docs.sort(function (a, b) {
			return parseInt(b.downloads) - parseInt(a.downloads);
		      }));
		    } else {
		      failure_function.call(this, collection_name, ia_data);
		    }
		  }
		}
	      }, failure_function);
}


IA.prototype.get_metadata = function(identifier, success_callback, failure_callback) {
  var self = this;
  var request = new XMLHttpRequest();
  request.responseType = "application/json";
  request.addEventListener("load", function() {
    if (200 != request.status) {
      failure_callback.call(self, request);
    } else {
      success_callback.call(self, JSON.parse(request.response));
    }
  });
  request.addEventListener("error", function (error) {
    failure_callback.call(self, request, error);
  });
  request.addEventListener("timeout", function () {
    console.log("timeout");
  });

  var request_string = this.APIURL + "metadata/" + identifier;
  request.open("GET", request_string);
  request.setRequestHeader("Content-Type", "application/json")
  request.setRequestHeader("Accept", "application/json")
  request.send();
}
