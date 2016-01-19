function IA(options) {
  this.APIURL = options.APIURL;
}

IA.prototype.search = function(query_string, search_options, success_callback, failure_callback) {
  var self = this;
  var request = new XMLHttpRequest();
  var option_string = "";
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
  var request_string = this.APIURL + "advancedsearch.php?q=" + query_string + option_string;
  request_string = encodeURI(request_string);
  request.open("GET", request_string);
  request.setRequestHeader("Content-Type", "application/json")
  request.setRequestHeader("Accept", "application/json")
  request.send();
}
