var viewModel = {
  // /// 1
  flash: ko.observable(),
  // /// 2
  shownOnce: ko.observable(),
  // /// 3
  currentPage: ko.observable(),
  // /// 4
  errors: ko.observableArray(),
  // /// 5
  items: ko.observableArray(),

  comments: ko.observableArray(),
  // /// 6
  selectedItem: ko.observable(),
  // /// 7
  newcontent: ko.observable(),

  beanid: ko.observable(0),

  filter: ko.observable(""),

  tempName: ko.observable(),
  tempDescription: ko.observable(),
  tempPlace: ko.observable(),

  tempItem: {
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
  // /// 8
  setFlash: function(flash) {
    this.flash(flash);
    this.shownOnce(false);
  },
  // /// 9
  checkFlash: function() {
    if (this.shownOnce() == true) {
      this.flash('');
    }
  },
  // /// 10
  clearTempItem: function() {
    this.tempItem.id('');
    this.tempItem.name('');
    this.tempItem.description('');
    this.tempItem.place('');
    this.tempItem.likes('');
    this.tempItem.updated_at('');
    this.tempItem.created_at('');
  },

  clearComments: function() {
    this.comments('');
  },
  // /// 11
  prepareTempItem : function() {
    this.tempItem.id(ko.utils.unwrapObservable(this.selectedItem().id));
    this.tempItem.name(ko.utils.unwrapObservable(this.selectedItem().name));
    this.tempItem.description(ko.utils.unwrapObservable(this.selectedItem().description));
    this.tempItem.place(ko.utils.unwrapObservable(this.selectedItem().place));
    this.tempItem.likes(ko.utils.unwrapObservable(this.selectedItem().likes));
    this.tempItem.updated_at(ko.utils.unwrapObservable(this.selectedItem().updated_at));
    this.tempItem.created_at(ko.utils.unwrapObservable(this.selectedItem().created_at));
  },
  // /// 12
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
      success: function(createdItem) {
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

  // /// 13
  showAction: function(itemToShow) {
    this.checkFlash();
    this.errors([]);
    this.newcontent('');
    this.selectedItem(itemToShow);
    this.prepareTempItem();
    var url = '/coffeebeans/' + itemToShow.id + '/comments.json';
    $.getJSON(url, function(data) {
      viewModel.comments(data);
    });
    this.currentPage('show');
    this.shownOnce(true);
    this.beanid(itemToShow.id);
  },
  // /// 14
  newAction: function() {
    this.checkFlash();
    this.currentPage('new');
    this.clearTempItem();
    this.shownOnce(true);
  },
  // /// 15
  editAction: function(itemToEdit) {
    this.checkFlash();
    this.selectedItem(itemToEdit);
    this.prepareTempItem();
    this.currentPage('edit');
    this.shownOnce(true);
  },

  addComment: function() {
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
      success: function(createdItem) {
        viewModel.errors([]);
        
        viewModel.comments.push(viewModel.newcomment);
        viewModel.newcontent('');
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });
  },
  // /// 16
  createAction: function(itemToCreate) {
    var json_data = ko.toJS(itemToCreate);
    $.ajax({
      type: 'POST',
      url: '/coffeebeans.json',
      data: {
        // /// 17
        coffeebean: json_data
      },
      dataType: "json",
      success: function(createdItem) {
        viewModel.errors([]);
        viewModel.setFlash('Post successfully created.');
        viewModel.showAction(createdItem);
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });
  },

  tryAction: function(itemToUpdate) {
    itemToUpdate.likes(itemToUpdate.likes() + 1);
    var temp = 0;
    var json_data = ko.toJS(itemToUpdate);
    delete json_data.id;
    delete json_data.created_at;
    delete json_data.updated_at;

    $.ajax({
      type: 'PUT',
      url: '/coffeebeans/' + itemToUpdate.id() + '.json',
      data: {
        coffeebean: json_data
      },
      dataType: "json",
      success: function(updatedItem) {
        viewModel.errors([]);
      
        viewModel.showAction(updatedItem);
        this.temp(1);
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });  

  },
  // /// 18
  updateAction: function(itemToUpdate) {
    var json_data = ko.toJS(itemToUpdate);
    delete json_data.id;
    delete json_data.created_at;
    delete json_data.updated_at;

    $.ajax({
      type: 'PUT',
      url: '/coffeebeans/' + itemToUpdate.id() + '.json',
      data: {
        coffeebean: json_data
      },
      dataType: "json",
      success: function(updatedItem) {
        viewModel.errors([]);
        viewModel.setFlash('Post successfully updated.');
        viewModel.showAction(updatedItem);
      },
      error: function(msg) {
        viewModel.errors(JSON.parse(msg.responseText));
      }
    });
  },
  // /// 19
  destroyAction: function(itemToDestroy) {
    if (confirm('Are you sure?')) {
      $.ajax({
        type: "DELETE",
        url: '/coffeebeans/' + itemToDestroy.id + '.json',
        dataType: "json",
        success: function(){
          viewModel.errors([]);
          viewModel.setFlash('Post successfully deleted.');
          viewModel.indexAction();
        },
        error: function(msg) {
          viewModel.errors(JSON.parse(msg.responseText));
        }
      });
    }
  }
};

ko.utils.stringStartsWith = function (string, startsWith) {         
  string = string || "";
  if (startsWith.length > string.length)
      return false;
  return string.substring(0, startsWith.length) === startsWith;
};

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


// /// 20
$(document).ready(function() {
  ko.applyBindings(viewModel);
  viewModel.indexAction();
  viewModel.clearTempItem();
});
