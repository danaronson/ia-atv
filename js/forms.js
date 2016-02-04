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

  product_bundle_template: `<productBundleTemplate>
                              <background/>
                              <banner>
                                <stack>
                                  <title id="title"/>
                                  <text id="description"/>
                                  <row>
                                    <buttonLockup>
                                      <badge src="resource://button-preview" />
                                      <title>Play</title>
                                    </buttonLockup>
                                  </row>
                                </stack>
                                <heroImg id="heroImg"/>
                              </banner>
                              <shelf>
                                <header>
                                  <title>Movies</title>
                                </header>
                                <section id="section"/>
                              </shelf>
                            </productBundleTemplate>`,
    
    

  tmp_template: `<catalogTemplate itmlID="id_3">
    <banner itmlID="id_4">
    <title id="title" itmlID="id_5">Digitized From VHS</title>
    </banner>
    <list itmlID="id_8">
    <section id="section" itmlID="id_9">
    <listItemlockup itmlID="id_10" ia_ID="Real_Stories_of_the_Highway_Patrol_-_Car_Crashes_Crisis_on_the_Interstate_1996_VHSRip">
    <title itmlID="id_11">Real Stories of the Highway Patrol - Car Crashes Crisis on the Interstate</title>
    </listItemlockup>
    <listItemlockup itmlID="id_13" ia_ID="CNN_Video_-_The_Road_to_the_White_House_92_1992_VHSRip">
    <title itmlID="id_14">CNN Video - The Road to the White House 92</title>
    </listItemlockup>
    </section>
    </list>
    </catalogTemplate>
    `,

  tmp1_template: `  <catalogTemplate>
    <banner>
    <title>Movies</title>
    </banner>
    <list>
    <section>
    <listItemLockup>
    <title>All Movies</title>
    <decorationLabel>6</decorationLabel>
    </listItemLockup>
    </section>
    </list>
    </catalogTemplate>
    `,

    tmp2_template: `  <catalogTemplate>
    <banner>
    <title>Movies</title>
    </banner>
    <list>
    <section>
    <listItemLockup>
    <title>All Movies</title>
    <decorationLabel>6</decorationLabel>
    <relatedContent>
    <grid>
    <section>
    <lockup>
    <img src="path to images on your server/Car_Movie_250x375_A.png" width="250" height="376" />
    <title>Movie 1</title>
    </lockup>
    </section>
    </grid>
    </relatedContent>
    </listItemLockup>
    </section>
    </list>
    </catalogTemplate>
    `,

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
    this.add_menu_item(APP.movies_doc, "movies", APP.top_doc);
    this.add_menu_item(APP.music_doc, "music", APP.top_doc);
    APP.movies_doc.getElementById('title').innerHTML = "movies";
    APP.music_doc.getElementById('title').innerHTML = "music";
    return;
  }
}
