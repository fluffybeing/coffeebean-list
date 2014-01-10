var viewModel = {
  
  // temporary obserables
  tempName: ko.observable(),
  tempDescription: ko.observable(),
  tempPlace: ko.observable(),

  tmpCoffeebean: {
    id: ko.observable(),
    name: ko.observable(),
    description: ko.observable(),
    place: ko.observable(),
    likes: ko.observable(),
    updated_at: ko.observable(),
    created_at: ko.observable()
  },

  newcomment: {
    coffeebean_id: "",
    content: ""
  },

  newBean: {
    name: "",
    description: "",
    place: "",
    likes: 0
  },
  
  // knockout obserables for flash checking
  flash: ko.observable(),
  shownOnce: ko.observable(),
  // check for display
  setFlash: function(flash) {
    this.flash(flash);
    this.shownOnce(false);
  },
  

  checkFlash: function() {
    if (this.shownOnce() == true) {
      this.flash('');
    }
  },
  
  // obserables to check current page and erros display
  currentPage: ko.observable(),
  errors: ko.observableArray(),
  // index page renderer
  indexAction: function() {
    this.checkFlash();
    this.errors([]);
    this.flash('');
    this.clearComments();
    $.getJSON('/coffeebeans.json', function(data) {
      viewModel.items(data);
      viewModel.currentPage('index');
      viewModel.shownOnce(true);
    });
  },

  // obserables for items, comments and selection
  items: ko.observableArray(),
  comments: ko.observableArray(),
  selectedItem: ko.observable(),
  // add new beans to the tray
  createCoffeeAction: function(coffeeToCreate) {
    var json_data = ko.toJS(coffeeToCreate);
    $.ajax({
      type: 'POST',
      url: '/coffeebeans.json',
      data: {
        // /// 17
        coffeebean: json_data
      },
      dataType: "json",
      success: function(createdCoffee) {
        viewModel.errors([]);
        viewModel.setFlash('Post successfully created.');
        viewModel.ShowCoffeeAction(createdCoffee);
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });
  },

  // clear items
  clearCoffeebean: function() {
    this.tmpCoffeebean.id('');
    this.tmpCoffeebean.name('');
    this.tmpCoffeebean.description('');
    this.tmpCoffeebean.place('');
    this.tmpCoffeebean.likes('');
    this.tmpCoffeebean.updated_at('');
    this.tmpCoffeebean.created_at('');
  },
  // remove comments
  clearComments: function() {
    this.comments('');
  },
  
  // adding beans page renderer
  addBean: function() {
    this.newBean.name = this.tempName();
    this.newBean.description = this.tempDescription();
    this.newBean.place = this.tempPlace();
    var json_data = ko.toJS(this.newBean);
    
    $.ajax({
      type: 'POST',
      url: '/coffeebeans.json',
      data: {
        // /// 17
        coffeebean: json_data
      },
      dataType: "json",
      success: function(createdCoffee) {
        viewModel.errors([]);
      
        viewModel.items.push(viewModel.newBean);
        viewModel.tempName('');
        viewModel.tempDescription('');
        viewModel.tempPlace('');

      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });
    viewModel.indexAction();
  },

  // show action to display things
  ShowCoffeeAction: function(coffeeToShow) {
    this.checkFlash();
    this.errors([]);
    this.newcontent('');
    this.selectedItem(coffeeToShow);
    this.prepareTempItem();
    var url = '/coffeebeans/' + coffeeToShow.id + '/comments.json';
    $.getJSON(url, function(data) {
      viewModel.comments(data);
    });
    this.currentPage('show');
    this.shownOnce(true);
    this.beanid(coffeeToShow.id);
  },
  // new action for adding new bean
  newAction: function() {
    this.checkFlash();
    this.currentPage('new');
    this.clearCoffeebean();
    this.shownOnce(true);
  },

  prepareTempItem : function() {
    this.tmpCoffeebean.id(ko.utils.unwrapObservable(this.selectedItem().id));
    this.tmpCoffeebean.name(ko.utils.unwrapObservable(this.selectedItem().name));
    this.tmpCoffeebean.description(ko.utils.unwrapObservable(this.selectedItem().description));
    this.tmpCoffeebean.place(ko.utils.unwrapObservable(this.selectedItem().place));
    this.tmpCoffeebean.likes(ko.utils.unwrapObservable(this.selectedItem().likes));
    this.tmpCoffeebean.updated_at(ko.utils.unwrapObservable(this.selectedItem().updated_at));
    this.tmpCoffeebean.created_at(ko.utils.unwrapObservable(this.selectedItem().created_at));
  },

  
  // show action for edit
  editCoffeeAction: function(coffeeToEdit) {
    this.checkFlash();
    this.selectedItem(coffeeToEdit);
    this.prepareTempItem();
    this.currentPage('edit');
    this.shownOnce(true);
  },
  
  // obserables for searching beans
  newcontent: ko.observable(),
  beanid: ko.observable(0),
  filter: ko.observable(""),

  // add comments to the bean
  addCoffeebeanComment: function() {
    this.newcomment.coffeebean_id = this.beanid();
    this.newcomment.content = this.newcontent();
    var json_data = ko.toJS(this.newcomment);
    
    $.ajax({
      type: 'POST',
      url: '/coffeebeans/' + this.beanid() + '/comments.json',
      data: {
        // /// 17
        comment: json_data
      },
      dataType: "json",
      success: function(createdCoffee) {
        viewModel.errors([]);
        
        viewModel.comments.push(viewModel.newcomment);
        viewModel.newcontent('');
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });
  },
  
  
  // adding likes or marking as tried 
  tryCoffeeAction: function(updateCoffeebean) {
    updateCoffeebean.likes(updateCoffeebean.likes() + 1);
    var temp = 0;
    var json_data = ko.toJS(updateCoffeebean);
    delete json_data.id;
    delete json_data.created_at;
    delete json_data.updated_at;

    $.ajax({
      type: 'PUT',
      url: '/coffeebeans/' + updateCoffeebean.id() + '.json',
      data: {
        coffeebean: json_data
      },
      dataType: "json",
      success: function(updatedItem) {
        viewModel.errors([]);
      
        viewModel.ShowCoffeeAction(updatedItem);
        this.temp(1);
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });  

  },
  // editing or updating bean info
  updateAction: function(updateCoffeebean) {
    var json_data = ko.toJS(updateCoffeebean);
    delete json_data.id;
    delete json_data.created_at;
    delete json_data.updated_at;

    $.ajax({
      type: 'PUT',
      url: '/coffeebeans/' + updateCoffeebean.id() + '.json',
      data: {
        coffeebean: json_data
      },
      dataType: "json",
      success: function(updatedItem) {
        viewModel.errors([]);
        viewModel.setFlash('Post successfully updated.');
        viewModel.ShowCoffeeAction(updatedItem);
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });
  },
  
  // delete the coffeebean added
  destroyAction: function(itemToDestroy) {
    if (confirm('Are you sure?')) {
      $.ajax({
        type: "DELETE",
        url: '/coffeebeans/' + itemToDestroy.id + '.json',
        dataType: "json",
        success: function(){
          viewModel.errors([]);
          viewModel.setFlash('CoffeeBean successfully deleted.');
          viewModel.indexAction();
        },
        error: function(msg) {
          viewModel.errors(JSON.parse(msg.responseText));
        }
      });
    }
  }
};

// this function does the job of instant search
ko.utils.stringStartsWith = function (string, startsWith) {         
  string = string || "";
  if (startsWith.length > string.length)
      return false;
  return string.substring(0, startsWith.length) === startsWith;
};

// filter item according to their name
viewModel.filteredItems = ko.computed(function() {
    var filter = this.filter().toLowerCase();
    if (!filter) {
        return this.items();
    } else {
        return ko.utils.arrayFilter(this.items(), function(item) {
            return ko.utils.stringStartsWith(item.name.toLowerCase(), filter);
        });
    }
}, viewModel);


// apply the knockout properties with the html
$(document).ready(function() {
  ko.applyBindings(viewModel);
  viewModel.indexAction();
  viewModel.clearCoffeebean();
});
