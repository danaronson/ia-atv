"use strict";

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
 * Basically a bag of functions for dealing with DOM
*/
var Page = {
  /**
   * Base factory funcition for Page, will only really be called to extend() it
   * @method create
   */
  create: function(page_params) {
    var self = Object.create(this);
    var parser = new DOMParser();
    self.page_params = page_params;
    self.name = page_params.name;

    // build the doc from the template
    if ( self.template ) {
      self.doc =  parser.parseFromString("<document>" + self.template + "</document>", "application/xml");
    }
    console.log("Page.create - created doc for", self.name);
    self.after_doc_create();
    return self;
  },
  /**
   * This will get called after document is created, allowing us to manipulate it and add listeners
   * @method after_doc_create
   */
  after_doc_create: function() {
    console.log("Page.after_doc_create() - shouldn't be called");
  },
  /**
   * Add a node to the current Page doc
   * @method add_node
   * @param parent - node add child to
   * @param nodeName - child node to add
   * @param text (optional) - add a text node to the child also
   */
  add_node: function(parent, nodeName, text) {
    var node = this.doc.createElement(nodeName);
    parent.appendChild(node);
    if (text) {
      node.appendChild(this.doc.createTextNode(text));
    }
    return node;
  },
  /**
   * Remove all node from the parent node
   * @method add_node
   * @param parent - node to remove all children from
   */
  remove_all_child_nodes: function (parent) {
    while (parent.firstChild) {
        parent.removeChild( parent.firstChild );
    }    
  },
  /**
   * Insert a "lockup" item to a section
   * @method insert_lockup
   * @param section (Element) - section to add the item to
   * @param identifier
   * @param title
   * @param image_id
   */
  insert_lockup: function(section, identifier, title, image_id) {
    var doc = this.doc;
    var lockup = this.add_node(section, "lockup");
    if (!image_id) {
      image_id = identifier;
    }
    lockup.setAttribute("ia_ID", identifier);
    var img = this.add_node(lockup, "img")
    img.setAttribute("src", "https://archive.org/services/get-item-image.php?identifier=" + image_id);
    img.setAttribute("width", "360");
    img.setAttribute("height", "360");
    var title = this.add_node(lockup, "title", title);
  },
  /**
   * Push this page to the top of the nav stack
   * @method push
   */
  push: function () {
    navigationDocument.pushDocument(this.doc);
  },  
}

/*
 * Menu Page - This is the top level menu for our app
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
    var menu_item = this.add_node(menu_node, "menuItem");

    menu_item.setAttribute("id", subpage.name);
    this.add_node(menu_item, "title", subpage.name);
    menu_node.getFeature("MenuBarDocument").setDocument(subpage.doc, menu_item);
  },  
});

/*
 * Collection Stack Page - we create one of these for movies, and one for music
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
  collections: [],
  //
  after_doc_create: function() {
    // make it an official param   
    this.collection_type = this.page_params.collection_type;
    var self = this;
      APP.ia.get_collections( this.collection_type, "collection", undefined,
        function success (collection_name, ia_data) {
          self.process_collection_data(collection_name, ia_data);
        },
        function failure (collection_name, ia_data) {
          console.log("didn't get " + collection_name + " collection");
      });
  },
  //
  // Process the results of the IA request and display them
  //
  process_collection_data: function(collection_name, ia_collections) {
    var self = this;
    var doc = this.doc;

    this.collection_name = collection_name;

    var section = doc.getElementById('section');
    var title = doc.getElementById('title');

    for (var id in ia_collections) {
      // save data on this page object
      var collection = ia_collections[id];
      this.collections[collection["identifier"]] = collection;
      // insert it into doc
      this.insert_lockup(section, collection["identifier"], collection["title"] + " (" + collection["downloads"] + ")");
    }

    // add event triggers for the items
    section.addEventListener("highlight", function (event) {
      title.innerHTML = collection_name + " (" + event.target.getAttribute("ia_ID") + ")";
    });
    section.addEventListener("select", function (event) {
      self.show_catalog_page(event.target.getAttribute("ia_ID"));
    });
  },
  //
  // Event handler for choosing a collection
  //
  show_catalog_page: function(ia_ID) {
    var collection_item = this.collections[ia_ID];

    var collection_page = CollectionByYearPage.create({
      name: collection_item["title"],
      collection_item: collection_item,
      collection_name: this.collection_name,
      collection_id: ia_ID,
    });
    collection_page.push();
  },
});

/*
 * Collection items, grouped by year.
*/
var CollectionByYearPage = Page.extend({
  //
  template:  `<showcaseTemplate mode="showcase">
                <background/>
                <banner>
                  <title id="title"/>
                </banner>
                <carousel>
                  <section id="section"/>
                </carousel>
              </showcaseTemplate>`,
  //
  after_doc_create: function() {
    var self = this;
    var doc = this.doc;

    this.items_by_year = {};

    this.collection_name = this.page_params.collection_name;
    this.collection_id   = this.page_params.collection_id;
    this.collection_item = this.page_params.collection_item;
    console.log("CollectionByYearPage",this);

    // set title
    doc.getElementById("title").innerHTML = this.collection_item["title"];

    this.section = doc.getElementById("section");
    this.section.addEventListener("select", function (event) {
      self.show_items_for_year(event.target.getAttribute("ia_ID"));
    });

    // request collections from IA
    APP.ia.get_collections(this.collection_id, this.collection_name, undefined,
      function success (collection_name, ia_data) {
        self.process_collection_data( collection_name, ia_data )
    });
  },

  //
  // Process the results of the IA request and display them
  //
  process_collection_data: function(collection_name, ia_data) {
    var self = this;
    // keep track of which years have items
    var year_has_items = {};

    ia_data.map(function (ia_item) {
      var year = ia_item.year || "Undated";
      year_has_items[year] = true;
      // bin the item by year
      if (!(year in self.items_by_year)) {
        self.items_by_year[year] = [];
      }
      (self.items_by_year[year]).push(ia_item);
    });
    // create a icon for each year
    Object.keys(year_has_items).sort(function (a, b) {
      return parseInt(b) - parseInt(a);
    }).map(function (year) {
      self.insert_lockup(
        self.section,
        year, // lockup item id
        year + " (" + self.items_by_year[year].length + ")",
        self.collection_id
      );
    });
  },
  //
  // Show the items for the selected year
  //
  show_items_for_year: function(year) {
    var yearpage = CollectionYearItemsPage.create({
      name: year,
      items: this.items_by_year[year],
      collection_name: this.collection_name,
    });
    yearpage.push();
  }
}); // CollectionByYearPage


/*
 * Collection items for the given year
*/
var CollectionYearItemsPage = Page.extend({
  //
  template:  `<showcaseTemplate mode="showcase">
                <background/>
                <banner>
                  <title id="title"/>
                </banner>
                <carousel>
                  <section id="section"/>
                </carousel>
              </showcaseTemplate>`,
  //
  after_doc_create: function() {
    var self = this;
    var doc = this.doc;

    console.log("CollectionYearItemsPage.after_doc_create", this);

    this.collection_name = this.page_params.collection_name;
    this.items = this.page_params.items;

    var section = doc.getElementById("section");
    section.addEventListener("select", function (event) {
      APP.play_item(event, self.collection_name);
    });

    var sorted_items = this.items.sort(function (item_a, item_b) {
      return parseInt(item_b.week) - parseInt(item_a.week);
    });

    doc.getElementById("title").innerHTML = this.name;
    sorted_items.map(function (item) {
      self.insert_lockup(section, item.identifier, item.title);
    });

  }
}); // CollectionYearItemsPage


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

    // save off useful elements
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
  //  Trigger request for new results when the search text changes
  //
  on_text_change: function() {
    var self = this;
    var search_options = {
      "rows" : "50", // TODO
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
        Page.remove_all_child_nodes(self.movie_section);
        Page.remove_all_child_nodes(self.music_section);
        // insert new results
        docs.map(function shelf_insert(item) {
          var section = item.mediatype == 'movies' ? self.movie_section : self.music_section;
          self.insert_lockup(section, item.identifier, item.title);
        });
      }, function failure() {
        // TODO: handle search error
      });
  },
}); // SearchPage