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

  tmp_template: ` <stackTemplate itmlID="id_3">
    <banner itmlID="id_4">
    <title id="title" itmlID="id_6">movies</title>
    </banner>
    <collectionList itmlID="id_5">
    <grid itmlID="id_7">
    <section id="section" itmlID="id_8">
    <lockup itmlID="id_11" ia_ID="thechrisgethardshow">
    <img itmlID="id_12" src="https://archive.org/services/get-item-image.php?identifier=thechrisgethardshow" width="182" height="274"/>
    <title itmlID="id_13">The Chris Gethard Show</title>
    </lockup></section></grid></collectionList></stackTemplate>`,
    

  add_menu_item: function(menu_item_doc, id, menu_doc) {
    var menu_node = menu_doc.getElementById("menu");
    var menu_item = this.add_node(menu_doc, menu_node, "menuItem");
    menu_item.setAttribute("id", id);
    this.add_node(menu_doc, menu_item, "title", id);
    menu_node.getFeature("MenuBarDocument").setDocument(menu_item_doc, menu_item);
  },

  insert_lockup: function(doc, section, identifier, title) {
    var lockup = this.add_node(doc, section, "lockup");
    lockup.setAttribute("ia_ID", identifier);
    var img = this.add_node(doc, lockup, "img")
    img.setAttribute("src", "https://archive.org/services/get-item-image.php?identifier=" + identifier);
    img.setAttribute("width", "180");
    img.setAttribute("height", "180");
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
    this.add_menu_item(APP.movies_doc, "movies", APP.top_doc);
    APP.movies_doc.getElementById('title').innerHTML = "movies";
    this.push(APP.top_doc);
    return;
  }
}
