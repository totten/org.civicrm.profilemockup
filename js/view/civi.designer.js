(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Designer) Civi.Designer = {};

    /**
     * options:
     * - model: Civi.Form.FieldModel
     */
    Civi.Designer.FieldView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        render: function(){
            var field_template = _.template($('#field_template').html(), {
              formField: this.model,
              paletteField: this.options.paletteFieldModel
            });
            this.$el.html(field_template);
        },
    });

    /**
     * options:
     * - model: Civi.Form.FieldModel
     */
    Civi.Designer.FieldDetailView = Backbone.View.extend({
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
    Civi.Designer.FormView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        events: {
          "click .crm-profilemockup-buttons": 'doToggleForm'
        },
        render: function(){
            $(this.$el).find('.crm-profilemockup-form-title').text(this.model.get('title'));
            //$(this.$el).find('.crm-profilemockup-buttons').button({icons: {primary: 'ui-icon-pencil'}, text: false})
            //$(this.$el).find('.crm-profilemockup-buttons')
            this.detailView = new Civi.Designer.FormDetailView({
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
    Civi.Designer.FormDetailView = Backbone.View.extend({
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
     *
     * options:
     *  - model: PaletteFieldCollection
     */
    Civi.Designer.PaletteView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            var fieldsByEntitySection = this.model.groupBy(function(paletteFieldModel){
              return paletteFieldModel.get('entityName') + '-' + paletteFieldModel.get('sectionName');
            });
            console.log('fieldsByEntitySection', fieldsByEntitySection);
            var sections = {};
            _.each(fieldsByEntitySection, function(localPaletteFields, sectionId, label){
              sections[sectionId] = _.first(localPaletteFields).getSection();
            });
            console.log('sections', sections);

            var palette_template = _.template($('#palette_template').html(), {
              sections: sections,
              fieldsByEntitySection: fieldsByEntitySection
            });
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

            var paletteFieldView = this;
            $( ".crm-profilemockup-fields" ).droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: ":not(.ui-sortable-helper)",
                drop: function( event, ui ) {
                    $('.placeholder').hide(); // FIXME
                    var paletteFieldModel = paletteFieldView.model.getByCid(ui.draggable.attr('data-plm-cid'));
                    var formFieldModel = paletteFieldModel.createFormFieldModel();
                    var formFieldDetailView = new Civi.Designer.FieldView({
                        el: $("<div></div>"),
                        model: formFieldModel,
                        paletteFieldModel: paletteFieldModel
                    });
                    formFieldDetailView.$el.appendTo(this);
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
    Civi.Designer.DesignerView = Backbone.View.extend({
        initialize: function() {
            this.paletteFieldCollection = new Civi.Designer.PaletteFieldCollection();
            this.paletteFieldCollection.addEntity('contact', Civi.Core.IndividualModel);
            this.paletteFieldCollection.addEntity('act', Civi.Core.ActivityModel);
            this.render();
        },
        events: {
            'click .crm-profilemockup-save': 'doSave',
            'click .crm-profilemockup-preview': 'doPreview',
        },
        render: function() {
            this.$el.html( _.template($('#designer_template').html()) );

            // Setup accordion after open to ensure proper height
            this.paletteView = new Civi.Designer.PaletteView({
              model: this.paletteFieldCollection,
              el: $('.crm-profilemockup-palette')
            });
            $('.crm-profilemockup-save').button();
            $('.crm-profilemockup-preview').button();

            var formModel = new Civi.Form.FormModel({id: 5, title: 'October Survey', help_post: (new Date()).toString()});
            var formDetailView = new Civi.Designer.FormView({
                el: $('.crm-profilemockup-form', this.$el),
                model: formModel
            });
            /*
            var paletteFieldModel = new Civi.Designer.PaletteFieldModel({
                modelClass: Civi.Core.IndividualModel,
                fieldName: 'custom_456'
            });
            var formFieldModel = paletteFieldModel.createFormFieldModel();
            var formFieldDetailView = new Civi.Designer.FieldDetailView({
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
