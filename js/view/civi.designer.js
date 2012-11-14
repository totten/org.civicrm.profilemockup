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
            $('.crm-designer-form-detail').toggle('blind', 250); // FIXME: this.$
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
            var $acc = $(this.$el).find('.crm-designer-palette-acc'); // FIXME: this.$
            $acc.accordion({
                heightStyle: 'fill',
                autoHeight: true
            });
            $acc.find('.crm-designer-palette-field').draggable({
                appendTo: "body",
                zIndex: $(this.$el).zIndex()+5000,
                helper: "clone",
                connectToSortable: '.crm-designer-fields' // FIXME: tight canvas/palette coupling
            });

            // FIXME: tight canvas/palette coupling
            $(".crm-designer-fields").droppable({ // FIXME: this.$
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: ":not(.ui-sortable-helper)"
            });
        },
        destroy: function() {
            $(this.$el).find('.crm-designer-palette-acc').accordion('destroy'); // FIXME: this.$
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
            this.model.get('fieldCollection').on('add', this.updatePlaceholder, this);
            this.model.get('fieldCollection').on('remove', this.updatePlaceholder, this);
        },
        events: {
            'click .crm-designer-save': 'doSave',
            'click .crm-designer-preview': 'doPreview',
        },
        render: function() {
            var designerView = this;
            this.$el.html( _.template($('#designer_template').html()) );

            // RIGHT: Setup accordion after open to ensure proper height
            this.paletteView = new Civi.Designer.PaletteView({
              model: this.options.paletteFieldCollection,
              el: $('.crm-designer-palette') // FIXME: this.$
            });
            $('.crm-designer-save').button(); // FIXME: this.$
            $('.crm-designer-preview').button(); // FIXME: this.$

            // TOP: Setup form-level editing
            var formDetailView = new Civi.Designer.FormView({
                el: $('.crm-designer-form', this.$el), // FIXME: this.$
                model: this.model
            });

            // BOTTOM: Setup field-level editing
            var $fields = this.$('.crm-designer-fields');
            this.updatePlaceholder();
            var formFieldModels = this.model.get('fieldCollection').sortBy(function(formFieldModel){
              return formFieldModel.get('weight');
            });
            _.each(formFieldModels, function(formFieldModel){
                // FIXME: Civi.Form.FieldModel doesn't have enough info to locate
                // matching Civi.Designer.PaletteFieldModel unless one assumes that
                // (formFieldModel.field_type === paletteFieldModel.entity_name)
                var paletteFieldModel = designerView.options.paletteFieldCollection.getFieldByName(formFieldModel.get('field_type'), formFieldModel.get('field_name'));
                var formFieldDetailView = new Civi.Designer.FieldView({
                    el: $("<div></div>"),
                    model: formFieldModel,
                    paletteFieldModel: paletteFieldModel
                });
                formFieldDetailView.$el.appendTo($fields);
            });
            $(".crm-designer-fields").sortable({ // FIXME: this.$
                receive: function(event, ui) {
                    var paletteFieldModel = designerView.options.paletteFieldCollection.getByCid(ui.item.attr('data-plm-cid'));
                    var formFieldModel = paletteFieldModel.createFormFieldModel();
                    designerView.model.get('fieldCollection').add(formFieldModel);

                    var formFieldDetailView = new Civi.Designer.FieldView({
                        el: $("<div></div>"),
                        model: formFieldModel,
                       paletteFieldModel: paletteFieldModel
                    });
                    $('.crm-designer-fields .ui-draggable').replaceWith(formFieldDetailView.$el); // FIXME: this.$
                },
                update: function() {
                    designerView.updateWeights();
                }
            }).disableSelection();
        },
        doSave: function(event) {
            console.log('save');
        },
        doPreview: function(event) {
            console.log('preview');
        },
        /** Determine visual order of fields and set the model values for "weight" */
        updateWeights: function() {
            var designerView = this;
            var weight = 1;
            var rows = this.$('.crm-designer-fields .crm-designer-row').each(function(key,row){
                if ($(row).hasClass('placeholder')) {
                  return;
                }
                var formFieldModel = designerView.model.get('fieldCollection').getByCid($(row).attr('data-field-cid'));
                formFieldModel.set('weight', weight);
                weight++;
            });
        },
        updatePlaceholder: function() {
            if (this.model.get('fieldCollection').isEmpty()) {
                this.$('.placeholder').show();
            } else {
                this.$('.placeholder').hide();
            }
        },
        destroy: function() {
            // TODO reconcile with View.remove()
            if (this.paletteView) {
                this.paletteView.destroy();
            }
        }
    });
})();
