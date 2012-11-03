cj(document).ready(function($){
    var showMessage = function(msg) {
      console.log(msg);
    };

    // Model
    var Person = Backbone.Model.extend({
        defaults: {
            name: 'Fetus',
            age: 0,
            child: ''
        },
        initialize: function(){
            showMessage("Welcome to this world");
            this.on('change:name', function(model) {
                showMessage("Changed name to " + model.get("name"));
            });
        },
        adopt: function( newChildsName ){
            this.set({ child: newChildsName });
        }
    });


    // View
    var PersonView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        render: function(){
            var template = _.template( $("#person_template").html(), this.model.toJSON() );
            this.$el.html( template );
        },
        events: {
            "click input[type=button]": "doSave"
        },
        doSave: function( event ){
            this.model.set("name", $("input[name=new_name]", this.$el).val() );
            this.render();
        }
    });

    // Router
    var AppRouter = Backbone.Router.extend({
      routes: {
        'person/:name': 'showPerson',
        '*actions': 'defaultRoute'
      }
    });
    var app_router = new AppRouter();
    app_router.on('route:showPerson', function(name) {
      var person = new Person({ name: name, age: 67, child: 'Ryan'});
      var person_view = new PersonView({ el: $("#profile_editor_app"), model: person });
    });
    app_router.on('route:defaultRoute', function(name) {
      alert('defaultRoute');
    });
    Backbone.history.start();
});
