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
    Civi.Form.FormView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        events: {
          "click .crm-profilemockup-form-prop": 'doToggleForm'
        },
        render: function(){
            $(this.$el).find('.crm-profilemockup-form-title').text(this.model.get('title'));
            $(this.$el).find('.crm-profilemockup-form-prop').button({icons: {primary: 'ui-icon-pencil'}, text: false})
            this.detailView = new Civi.Form.FormDetailView({
                model: this.model,
                el: $(this.$el).find('.crm-profilemockup-form-detail')
            });
            this.detailView.$el.hide();
        },
        doToggleForm: function(event) {
            $('.crm-profilemockup-form-detail').toggle('blind', 250);
        }
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
     * Display a selection of available fields
     */
    Civi.Form.PaletteView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            var palette_template = _.template( $('#palette_template').html() );
            this.$el.append(palette_template);
            var $acc = $(this.$el).find('.crm-profilemockup-palette-acc')
            $acc.accordion({
                heightStyle: 'fill',
                autoHeight: true
            });
            $acc.find('.crm-profilemockup-palette-field').draggable({
                appendTo: "body",
                zIndex: $(this.$el).zIndex()+5000,
                helper: "clone"
            });

            $( ".crm-profilemockup-fields" ).droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: ":not(.ui-sortable-helper)",
                drop: function( event, ui ) {
                    console.log(ui.draggable.attr('data-fr'));
                    $( "<div></div>" ).text( "ADDED: " + ui.draggable.text() ).appendTo( this );
                }
            }).sortable().disableSelection();
        },
        destroy: function() {
            $(this.$el).find('.crm-profilemockup-palette-acc').accordion('destroy');
        }
    });

    /**
     * Display a complete form-editing UI, including canvas, palette, and
     * buttons.
     */
    Civi.Form.DesignerView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        events: {
            'click .crm-profilemockup-save': 'doSave',
            'click .crm-profilemockup-preview': 'doPreview',
        },
        render: function() {
            this.$el.html( _.template($('#designer_template').html()) );

            // Setup accordion after open to ensure proper height
            this.paletteView = new Civi.Form.PaletteView({
              el: $('.crm-profilemockup-palette')
            });
            $('.crm-profilemockup-save').button();
            $('.crm-profilemockup-preview').button();

            var formModel = new Civi.Form.FormModel({id: 5, title: 'October Survey', help_post: (new Date()).toString()});
            var formDetailView = new Civi.Form.FormView({
                el: $('.crm-profilemockup-form', this.$el),
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
        doSave: function(event) {
            console.log('save');
        },
        doPreview: function(event) {
            console.log('preview');
        },
        destroy: function() {
            // TODO reconcile with View.remove()
            this.paletteView.destroy();
        }
    });
})();
