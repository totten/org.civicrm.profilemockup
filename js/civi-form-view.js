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
     * options:
     * - model: Civi.Form.FormModel
     */
    Civi.Form.FormDetailView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        render: function(){
            var form = new Backbone.Form({
                model: this.model,
                fields: ['title', 'is_active', 'help_pre', 'help_post']
            });
            this.$el.html(form.render().el);
        },
    });

    /**
     * Display a list
     */
    Civi.Form.DesignerView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        events: {
            'click .crm-profilemockup-save': 'onSave',
            'click .crm-profilemockup-preview': 'onPreview',
        },
        render: function() {
            this.$el.html( _.template($('#designer_template').html()) );

            // Setup accordion after open to ensure proper height
            var palette_template = _.template( $('#palette_template').html() );
            $('.crm-profilemockup-palette').append(palette_template);
            $('.crm-profilemockup-palette').accordion({
                heightStyle: 'fill',
                autoHeight: true
            });
            $('.crm-profilemockup-save').button();
            $('.crm-profilemockup-preview').button();

            var formModel = new Civi.Form.FormModel({id: 5, title: 'October Survey', help_post: (new Date()).toString()});
            var formDetailView = new Civi.Form.FormDetailView({
                el: $('.crm-profilemockup-formdetail', this.$el),
                model: formModel
            });
            /*
            var formFieldModel = Civi.Form.createFormFieldModel(Civi.Core.IndividualModel, 'last_name');
            var formFieldDetailView = new Civi.Form.FieldDetailView({
                el: $("#profile_editor_app"),
                model: formFieldModel
            });
            */
        },
        onSave: function(event) {
            console.log('save');
        },
        onPreview: function(event) {
            console.log('preview');
        },
        destroy: function() {
            // TODO reconcile with View.remove()
            $('.crm-profilemockup-palette').accordion('destroy');
        }
    });    
})();
