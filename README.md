# ia-atv

AppleTV interface to Internet Archive 


To get your development environment up and runnning:

1. Install Xcode
2. Copy Private.plist.template to Private.plist and edit it to include actual values.
    * APIURL is the prefix for the API resouce endpoints
    * JSPREFIX is the http(s) prefix for the directory serving javascript
    * SIMULATORJSPREFIX is the http prefix for the directory serving javascript for the simulator
4. The ia.js points to an HTTP server running locally.  To serve it locally, start up a simple server from the ia-atv directory by running the following: `python -m SimpleHTTPServer 9001`
5. To start editing the code, from the ia-atv directory run: `open atv/atv.xcodeproj.
6. While developing, you can use  the Safari webinspector to debug the javascript.
    * Make sure you have Safari 9.0 or newer
    * From the command line, run the following: `defaults write BUNDLEID WebKitDeveloperExtras -bool true`. You can find the current bundleid in the swift info
    * In Safari, click Develop > Simulator > Automatically Show Web Inspector for JSContexts
