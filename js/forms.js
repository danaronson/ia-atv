var Forms = {

  showcase_template: `<showcaseTemplate mode="showcase">
                        <background/>
                        <banner>
                          <title id="title"/>
                        </banner>
                        <carousel>
                          <section id="section"/>
                        </carousel>
                      </showcaseTemplate>`,

  // add_menu_item: function(menu_item_doc, id, menu_doc) {
  //   var menu_node = menu_doc.getElementById("menu");
  //   var menu_item = this.add_node(menu_doc, menu_node, "menuItem");
  //   menu_item.setAttribute("id", id);
  //   this.add_node(menu_doc, menu_item, "title", id);
  //   menu_node.getFeature("MenuBarDocument").setDocument(menu_item_doc, menu_item);
  // },

  insert_lockup: function(doc, section, identifier, title, image_id) {
    var lockup = this.add_node(doc, section, "lockup");
    if (!image_id) {
      image_id = identifier;
    }
    lockup.setAttribute("ia_ID", identifier);
    var img = this.add_node(doc, lockup, "img")
    img.setAttribute("src", "https://archive.org/services/get-item-image.php?identifier=" + image_id);
    img.setAttribute("width", "360");
    img.setAttribute("height", "360");
    var title = this.add_node(doc, lockup, "title", title);
  },

  insert_list_item_lockup: function(doc, section, identifier, title) {
    var lockup = this.add_node(doc, section, "listItemLockup");
    lockup.setAttribute("ia_ID", identifier);
    var title = this.add_node(doc, lockup, "title", title);
  },

  add_node: function (doc, parent, nodeName, text) {
    var node = doc.createElement(nodeName);
    parent.appendChild(node);
    if (text) {
      node.appendChild(doc.createTextNode(text));
    }
    return node;
  },

  remove_all_child_nodes: function (parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }    
  },

  make_doc: function (template) {
    var parser = new DOMParser();
    var doc =  parser.parseFromString("<document>" + template + "</document>", "application/xml");
    return doc;
  },

  push: function (doc) {
    navigationDocument.pushDocument(doc);
  },
}

/*
 * Helper for prototypal inheritance
*/
Object.prototype.extend = function (extension) {
  var hasOwnProperty = Object.hasOwnProperty;
  var object = Object.create(this);
  // properties are concatenated onto base object
  for (var property in extension)
    if (hasOwnProperty.call(extension, property) ||
      typeof object[property] === "undefined")
        object[property] = extension[property];
  return object;
};

/*
 * Page prototype object (not for direct use)
*/
var Page = {
  create: function(page_params) {
    var self = Object.create(this);
    var parser = new DOMParser();
    self.page_params = page_params;
    self.name = page_params.name;

    if ( self.template ) {
      self.doc =  parser.parseFromString("<document>" + self.template + "</document>", "application/xml");
    }
    self.after_doc_create();
    return self;
  },
  after_doc_create: function() {
    console.log("Page.after_doc_create() - shouldn't be called");
  },
}

/*
 * Menu Page prototype
*/
var MenuPage = Page.extend({
  //
  template: `<menuBarTemplate>
              <menuBar id="menu"/>
             </menuBarTemplate>`,
  //
  after_doc_create: function() {
    var movie_collection_page = CollectionStackPage.create({ name: "movies", collection_type: "movies" });
    var music_collection_page = CollectionStackPage.create({ name: "music", collection_type: "etree" });
    var search_page = SearchPage.create({ name: "search" })

    this.add_menu_item(movie_collection_page);
    this.add_menu_item(music_collection_page);
    this.add_menu_item(search_page);
  },
  add_menu_item: function( subpage ) {
    var menu_node = this.doc.getElementById("menu");
    var menu_item = Forms.add_node(this.doc, menu_node, "menuItem");

    menu_item.setAttribute("id", subpage.name);
    Forms.add_node(this.doc, menu_item, "title", subpage.name);
    menu_node.getFeature("MenuBarDocument").setDocument(subpage.doc, menu_item);
  },  
});

/*
 * Collection Stack Page - this is the top level page for movies or music
 * It displays a list of collections
*/
var CollectionStackPage = Page.extend({
  //
  template: `<stackTemplate>
               <banner>
                 <title id="title"/>
               </banner>
               <collectionList>
                 <grid>
                   <section id="section"/>
                 </grid>
               </collectionList>
             </stackTemplate>`,
  //
  after_doc_create: function() {
    // make it an official param   
    this.collection_type = this.page_params.collection_type;
    var self = this;
      APP.ia.get_collections( this.collection_type, "collection", undefined,
        function success (collection_name, collections) {
          APP.process_collection(collection_name, collections, self.doc);
        },
        function failure (collection_name, ia_data) {
          console.log("didn't get " + collection_name + " collection");
      });
  },
});

/*
 * Search Page - shows search keyboard and results in shelves
*/
var SearchPage = Page.extend({
  //
  template: `<searchTemplate>
               <searchField id="search"/>
               <collectionList>
                <shelf>
                  <header>
                   <title>Most Downloaded Movies</title>
                  </header>
                  <section id="movie_results"/>
                </shelf>
                <shelf>
                  <header>
                   <title>Most Downloaded Music</title>
                  </header>
                  <section id="music_results"/>
                </shelf>
               </collectionList>
              </searchTemplate>`,
  //
  after_doc_create: function() {
    var doc = this.doc;
    var self = this;

    // attach to doc
    this.keyboard = doc.getElementById('search').getFeature('Keyboard')
    this.movie_section = doc.getElementById("movie_results");
    this.music_section = doc.getElementById("music_results");

    // add event listeners
    this.music_section.addEventListener("select", function(event){
      APP.play_item(event, "etree");
    });

    this.movie_section.addEventListener("select", function(event){
      APP.play_item(event, "movies");
    });

    this.keyboard.onTextChange = function () {
      self.on_text_change();
    }
  },
  //  
  on_text_change: function() {
    var self = this;
    var search_options = {
      "rows" : "50",
      "fl[]" : "identifier,title,downloads,mediatype",
      "sort[]" : "downloads+desc"
    };
    APP.ia.search(this.keyboard.text+" AND mediatype:(etree OR movies)", search_options,
      function success(ia_data) {
        // got search results
        var docs = ia_data.response.docs;
        // clear old results
        console.log("search callback this:",this);
        console.log("search callback self:",self);
        Forms.remove_all_child_nodes(self.movie_section);
        Forms.remove_all_child_nodes(self.music_section);
        // insert new results
        docs.map(function shelf_insert(item) {
          var section = item.mediatype == 'movies' ? self.movie_section : self.music_section;
          Forms.insert_lockup(self.doc, section, item.identifier, item.title);
        });
      }, function failure() {
        // TODO: handle search error
      });
  },
});