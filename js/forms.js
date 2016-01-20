var Forms = {
  main: function() {
    return `<mainTemplate>
              <background>
                <img src="http://blogs.voanews.com/digital-frontiers/files/2012/05/Internet.Archive.jpg" />
              </background>
              <menuBar>
                <section>
                  <menuItem>
                    <title>MOVIES</title>
                  </menuItem>
                </section>
              </menuBar>
            </mainTemplate>`;
  },

  make_doc: function (template, callback) {
    var parser = new DOMParser();
    var doc =  parser.parseFromString("<document>" + template + "</document>", "application/xml");
    doc.addEventListener("select", callback);
    return doc;
  }
}
