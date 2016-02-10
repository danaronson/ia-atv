var Forms = {
  menu_template: `<menuBarTemplate>
                    <menuBar id="menu"/>
                  </menuBarTemplate>`,

  stack_template: `<stackTemplate>
                     <banner>
                       <title id="title"/>
                     </banner>
                     <collectionList>
                       <grid>
                         <section id="section"/>
                       </grid>
                     </collectionList>
                   </stackTemplate>`,

  search_template: `<searchTemplate>
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
                    
  catalog_template:   `<catalogTemplate>
                        <banner>
                          <title id="title"/>
                       </banner>
                       <list>
                         <section id="section"/>
                       </list>
                     </catalogTemplate>`,

  showcase_template: `<showcaseTemplate mode="showcase">
                        <background/>
                        <banner>
                          <title id="title"/>
                        </banner>
                        <carousel>
                          <section id="section"/>
                        </carousel>
                      </showcaseTemplate>`,

  add_menu_item: function(menu_item_doc, id, menu_doc) {
    var menu_node = menu_doc.getElementById("menu");
    var menu_item = this.add_node(menu_doc, menu_node, "menuItem");
    menu_item.setAttribute("id", id);
    this.add_node(menu_doc, menu_item, "title", id);
    menu_node.getFeature("MenuBarDocument").setDocument(menu_item_doc, menu_item);
  },

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

  make_menu: function () {
    APP.top_doc = this.make_doc(this.menu_template);
    APP.movies_doc = this.make_doc(this.stack_template);
    APP.music_doc = this.make_doc(this.stack_template);
    APP.search_doc = this.make_doc(this.search_template)
    this.add_menu_item(APP.movies_doc, "movies", APP.top_doc);
    this.add_menu_item(APP.music_doc, "music", APP.top_doc);
    this.add_menu_item(APP.search_doc, "search", APP.top_doc);
    return;
  }
}
