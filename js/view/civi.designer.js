(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Designer) Civi.Designer = {};

    /**
     * options:
     * - model: Civi.Form.FieldModel
     * - paletteField: Civi.Designer.PaletteFieldModel
     */
    Civi.Designer.FieldView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        events: {
          "click .crm-designer-action-settings": 'doToggleForm',
          "click .crm-designer-action-remove": 'doRemove'
        },
        render: function(){
            var field_template = _.template($('#field_template').html(), {
              formField: this.model,
              paletteField: this.options.paletteFieldModel
            });
            this.$el.html(field_template);
        },
        doToggleForm: function(event) {
          console.log('open field settings');
        },
        doRemove: function(event) {
          console.log('remove field');
        }
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
          "click .crm-designer-action-settings": 'doToggleForm'
        },
        render: function(){
            this.$('.crm-designer-form-title').text(this.model.get('title'));
            //this.$('.crm-designer-buttons').button({icons: {primary: 'ui-icon-pencil'}, text: false})
            //this.$('.crm-designer-buttons')
            this.detailView = new Civi.Designer.FormDetailView({
                model: this.model,
                el: this.$('.crm-designer-form-detail')
            });
            this.detailView.$el.hide();
        },
        doToggleForm: function(event) {
            $('.crm-designer-form-detail').toggle('blind', 250);
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
     *  - model: Civi.Designer.PaletteFieldCollection
     *
     * events:
     *  - dropPaletteField: function(paletteFieldModel, event, ui)
     */
    Civi.Designer.PaletteView = Backbone.View.extend({
        initialize: function() {
            this.render();
            this.model.on('add', this.render, this);
            this.model.on('remove', this.render, this);
        },
        render: function() {
            var fieldsByEntitySection = this.model.groupBy(function(paletteFieldModel){
              return paletteFieldModel.get('entityName') + '-' + paletteFieldModel.get('sectionName');
            });
            var sections = {};
            _.each(fieldsByEntitySection, function(localPaletteFields, sectionId, label){
              sections[sectionId] = _.first(localPaletteFields).getSection();
            });

            var palette_template = _.template($('#palette_template').html(), {
              sections: sections,
              fieldsByEntitySection: fieldsByEntitySection
            });
            this.$el.html(palette_template);
            var $acc = $(this.$el).find('.crm-designer-palette-acc');
            $acc.accordion({
                heightStyle: 'fill',
                autoHeight: true
            });
            $acc.find('.crm-designer-palette-field').draggable({
                appendTo: "body",
                zIndex: $(this.$el).zIndex()+5000,
                helper: "clone"
            });

            var paletteFieldView = this;
            $( ".crm-designer-fields" ).droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: ":not(.ui-sortable-helper)",
                drop: function( event, ui ) {
                    var paletteFieldModel = paletteFieldView.model.getByCid(ui.draggable.attr('data-plm-cid'));
                    paletteFieldView.trigger('dropPaletteField', paletteFieldModel, event, ui);
                }
            }).sortable().disableSelection();
        },
        destroy: function() {
            $(this.$el).find('.crm-designer-palette-acc').accordion('destroy');
        }
    });

    /**
     * Display a complete form-editing UI, including canvas, palette, and
     * buttons.
     *
     * options:
     *  - model: Civi.Form.FormModel
     *  - paletteFieldCollection: Civi.Designer.PaletteFieldCollection
     */
    Civi.Designer.DesignerView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        events: {
            'click .crm-designer-save': 'doSave',
            'click .crm-designer-preview': 'doPreview',
        },
        render: function() {
            this.$el.html( _.template($('#designer_template').html()) );

            // Setup accordion after open to ensure proper height
            console.log(this.options);
            this.paletteView = new Civi.Designer.PaletteView({
              model: this.options.paletteFieldCollection,
              el: $('.crm-designer-palette')
            });
            $('.crm-designer-save').button();
            $('.crm-designer-preview').button();
            this.paletteView.on('dropPaletteField', function(paletteFieldModel, event, ui) {
                $('.placeholder').hide(); // FIXME
                console.log('dropped event', event);
                var formFieldModel = paletteFieldModel.createFormFieldModel();
                var formFieldDetailView = new Civi.Designer.FieldView({
                    el: $("<div></div>"),
                    model: formFieldModel,
                    paletteFieldModel: paletteFieldModel
                });
                formFieldDetailView.$el.appendTo(event.target);
            });

            var formDetailView = new Civi.Designer.FormView({
                el: $('.crm-designer-form', this.$el),
                model: this.model
            });
            /*
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
