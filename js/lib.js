function IA(options) {
  this.APIURL = options.APIURL;
}

IA.prototype.search = function(query_string, search_options, success_callback, failure_callback) {
  var self = this;
  var request = new XMLHttpRequest();
  var option_string = "&output=json";
  for (var key in search_options) {
    option_string += "&" + key + "=" + search_options[key];
  }
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

  var request_string = this.APIURL + "advancedsearch.php?q=" + query_string + option_string;
  request_string = encodeURI(request_string);
  request.open("GET", request_string);
  request.setRequestHeader("Content-Type", "application/json")
  request.setRequestHeader("Accept", "application/json")
  request.send();
}

IA.prototype.get_collections = function(collection_name, result_type, num, success_function, failure_function) {
  var options = {"rows" : "10"}
  if (num) {
    options["rows"] = num.toString();
  }
  this.search("collection:(" + collection_name + ") AND mediatype:" + result_type, options,
	      function (ia_data) {
		if (0 == ia_data.responseHeader.status) {
		  if (!num) {
		    this.get_collections(collection_name, result_type, ia_data.response.numFound, success_function, failure_function);
		  } else {
		    if (num == ia_data.response.numFound) {
		      success_function.call(this, ia_data.response.docs);
		    } else {
		      failure_function.call(this, ia_data);
		    }
		  }
		}
	      }, failure_function);
}
  
