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
            this.model.on('change', this.renderSummary, this);
        },
        events: {
            "click .crm-designer-action-settings": 'doToggleForm',
            "click .crm-designer-action-remove": 'doRemove'
        },
        render: function(){
            var field_row_template = _.template($('#field_row_template').html(), {
              formField: this.model,
              paletteField: this.options.paletteFieldModel
            });
            this.$el.html(field_row_template);

            this.renderSummary();
            this.renderDetail();
        },
        renderSummary: function() {
            var field_summary_template = _.template($('#field_summary_template').html(), {
              formField: this.model,
              paletteField: this.options.paletteFieldModel
            });
            this.$('.crm-designer-field-summary').html(field_summary_template);
        },
        renderDetail: function() {
            this.detailView = new Civi.Designer.FieldDetailView({
                el: this.$el.find('.crm-designer-field-detail'),
                model: this.model
            });
            this.detailView.$el.hide();
        },
        doToggleForm: function(event) {
            this.$('.crm-designer-field-detail').toggle('blind', 250);
        },
        doRemove: function(event) {
          this.model.off('change', this.render, this);
          this.model.destroy();
          this.remove();
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
                fields: ['label', 'field_name', 'field_type', 'entity_name', 'is_active']
            });
            form.on('change', form.commit, form);
            this.$el.html(form.render().el);
        }
    });

    /**
     * options:
     * - model: Civi.Form.FormModel
     */
    Civi.Designer.FormView = Backbone.View.extend({
        initialize: function(){
            this.render();
            this.model.on('change', this.renderSummary, this); // FIXME: cleanup
        },
        events: {
            "click .crm-designer-action-settings": 'doToggleForm'
        },
        render: function() {
            var form_row_template = _.template($('#form_row_template').html(), {
              form: this.model
            });
            this.$el.html(form_row_template);

            this.renderSummary();
            this.renderDetail();
        },
        renderSummary: function() {
            var form_summary_template = _.template($('#form_summary_template').html(), {
                form: this.model
            });
            this.$('.crm-designer-form-summary').html(form_summary_template);
        },
        renderDetail: function() {
            this.detailView = new Civi.Designer.FormDetailView({
                model: this.model,
                el: this.$('.crm-designer-form-detail')
            });
            this.detailView.$el.hide();
        },
        doToggleForm: function(event) {
            this.$('.crm-designer-form-detail').toggle('blind', 250);
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
                fields: ['title', 'help_pre', 'help_post', 'is_active']
            });
            form.on('change', form.commit, form);
            this.$el.html(form.render().el);
        }
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
            var $acc = this.$('.crm-designer-palette-acc');
            $acc.accordion({
                heightStyle: 'fill',
                autoHeight: false,
                clearStyle: true
            });
            $acc.find('.crm-designer-palette-field').draggable({
                appendTo: "#crm-designer-designer",
                zIndex: $(this.$el).zIndex()+5000,
                helper: "clone",
                connectToSortable: '.crm-designer-fields' // FIXME: tight canvas/palette coupling
            });

            // FIXME: tight canvas/palette coupling
            this.$(".crm-designer-fields").droppable({
                activeClass: "ui-state-default",
                hoverClass: "ui-state-hover",
                accept: ":not(.ui-sortable-helper)"
            });
        },
        destroy: function() {
            this.$('.crm-designer-palette-acc').accordion('destroy');
        }
    });

    Civi.Designer.DesignerLayout = Backbone.Marionette.Layout.extend({
        template: '#designer_template',
        regions: {
            buttons: '.crm-designer-buttonset-region',
            palette: '.crm-designer-palette-region',
            form: '.crm-designer-form-region',
            fields: '.crm-designer-fields-region'
        }
    });

    Civi.Designer.ToolbarView = Backbone.Marionette.ItemView.extend({
        template: '#designer_buttons_template',
        events: {
            'click .crm-designer-save': 'doSave',
            'click .crm-designer-preview': 'doPreview'
        },
        render: function() {
            Backbone.Marionette.ItemView.prototype.render.apply(this);
            this.$('.crm-designer-save').button();
            this.$('.crm-designer-preview').button();
        },
        doSave: function(event) {
            console.log('save');
        },
        doPreview: function(event) {
            console.log('preview');
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
    Civi.Designer.FieldCanvasView = Backbone.View.extend({
        initialize: function() {
            this.model.get('fieldCollection').on('add', this.updatePlaceholder, this);
            this.model.get('fieldCollection').on('remove', this.updatePlaceholder, this);
        },
        render: function() {
            var designerView = this;
            this.$el.html( _.template($('#field_canvas_view_template').html()) );

            // BOTTOM: Setup field-level editing
            var $fields = this.$('.crm-designer-fields');
            this.updatePlaceholder();
            var formFieldModels = this.model.get('fieldCollection').sortBy(function(formFieldModel){
              return formFieldModel.get('weight');
            });
            _.each(formFieldModels, function(formFieldModel){
                var paletteFieldModel = designerView.options.paletteFieldCollection.getFieldByName(formFieldModel.get('entity_name'), formFieldModel.get('field_name'));
                var formFieldView = new Civi.Designer.FieldView({
                    el: $("<div></div>"),
                    model: formFieldModel,
                    paletteFieldModel: paletteFieldModel
                });
                formFieldView.$el.appendTo($fields);
            });
            this.$(".crm-designer-fields").sortable({
                placeholder: 'crm-designer-row-placeholder',
                forcePlaceholderSize: true,
                receive: function(event, ui) {
                    var paletteFieldModel = designerView.options.paletteFieldCollection.getByCid(ui.item.attr('data-plm-cid'));
                    var formFieldModel = paletteFieldModel.createFormFieldModel();
                    designerView.model.get('fieldCollection').add(formFieldModel);

                    var formFieldView = new Civi.Designer.FieldView({
                        el: $("<div></div>"),
                        model: formFieldModel,
                        paletteFieldModel: paletteFieldModel
                    });
                    designerView.$('.crm-designer-fields .ui-draggable').replaceWith(formFieldView.$el);
                },
                update: function() {
                    designerView.updateWeights();
                }
            });
        },
        /** Determine visual order of fields and set the model values for "weight" */
        updateWeights: function() {
            var designerView = this;
            var weight = 1;
            var rows = this.$('.crm-designer-row').each(function(key,row){
                if ($(row).hasClass('placeholder')) {
                  return;
                }
                var formFieldCid = $(row).attr('data-field-cid');
                var formFieldModel = designerView.model.get('fieldCollection').getByCid(formFieldCid);
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
        }
    });
})();
