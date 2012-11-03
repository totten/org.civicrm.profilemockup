(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Form) Civi.Form = {};

    /**
     * options:
     * - model: Civi.Form.FieldModel
     */
    Civi.Form.FieldDetailView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        render: function(){
            var form = new Backbone.Form({
                model: this.model,
                fields: ['label', 'field_name', 'field_type', 'is_active']
            });
            this.$el.html(form.render().el);
        },
    });

    /**
     * Display a list
     */
    Civi.Form.DesignerView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        render: function(){
        }
    });    
})();
