(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Designer) Civi.Designer = {};

    /**
     * A variation on Marionette.ItemView's serializeData() -- in addition to creating
     * variables for each model-property, the model and view objects are also exposed
     * as _view, _model, _collection, and _options.
     *
     * @return {*}
     */
    var extendedSerializeData = function() {
        var result = Marionette.ItemView.prototype.serializeData.apply(this);
        result._view = this;
        result._model = this.model;
        result._collection = this.collection;
        result._options = this.options;
        return result;
    }

    /**
     * options:
     * - model: Civi.Form.FieldModel
     * - paletteFieldModel: Civi.Designer.PaletteFieldModel
     */
    Civi.Designer.FieldView = Backbone.Marionette.Layout.extend({
        serializeData: extendedSerializeData,
        template: '#field_row_template',
        expanded: false,
        regions: {
            summary: '.crm-designer-field-summary',
            detail: '.crm-designer-field-detail'
        },
        events: {
            "click .crm-designer-action-settings": 'doToggleForm',
            "click .crm-designer-action-remove": 'doRemove'
        },
        initialize: function() {
            Backbone.Marionette.Layout.prototype.initialize.apply(this);
            this.render();
        },
        onRender: function() {
            this.summary.show(new Civi.Designer.FieldSummaryView({
                model: this.model,
                paletteFieldModel: this.options.paletteFieldModel
            }));
            this.detail.show(new Civi.Designer.FieldDetailView({
                model: this.model
            }));
            if (!this.expanded) {
                this.detail.$el.hide();
            }
        },
        doToggleForm: function(event) {
            this.expanded = !this.expanded;
            this.detail.$el.toggle('blind', 250);
        },
        doRemove: function(event) {
            this.model.destroy();
            this.remove();
        }
    });

    /**
     * options:
     * - model: Civi.Form.FieldModel
     * - paletteFieldModel: Civi.Designer.PaletteFieldModel
     */
    Civi.Designer.FieldSummaryView = Backbone.Marionette.ItemView.extend({
        serializeData: extendedSerializeData,
        template: '#field_summary_template',
        modelEvents: {
            'change': 'render'
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
    Civi.Designer.FormView = Backbone.Marionette.Layout.extend({
        serializeData: extendedSerializeData,
        template: '#form_row_template',
        expanded: false,
        regions: {
            summary: '.crm-designer-form-summary',
            detail: '.crm-designer-form-detail'
        },
        events: {
            "click .crm-designer-action-settings": 'doToggleForm'
        },
        onRender: function() {
            this.summary.show(new Civi.Designer.FormSummaryView({
                model: this.model
            }));
            this.detail.show(new Civi.Designer.FormDetailView({
                model: this.model
            }));
            if (!this.expanded) {
                this.detail.$el.hide();
            }
        },
        doToggleForm: function(event) {
            this.expanded = !this.expanded;
            this.detail.$el.toggle('blind', 250);
        }
    });

    /**
     * options:
     * - model: Civi.Form.FormModel
     */
    Civi.Designer.FormSummaryView = Backbone.Marionette.ItemView.extend({
        serializeData: extendedSerializeData,
        template: '#form_summary_template',
        modelEvents: {
            'change': 'render'
        }
    });

    /**
     * options:
     * - model: Civi.Form.FormModel
     */
    Civi.Designer.FormDetailView = Backbone.View.extend({
        initialize: function() {
            this.form = new Backbone.Form({
                model: this.model,
                fields: ['title', 'help_pre', 'help_post', 'is_active']
            });
            this.form.on('change', this.form.commit, this.form);
        },
        render: function(){
            this.$el.html(this.form.render().el);
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
            var palette_template = _.template($('#palette_template').html(), {
              sections: this.model.getSections(),
              fieldsByEntitySection: this.model.getFieldsByEntitySection()
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
        serializeData: extendedSerializeData,
        template: '#designer_template',
        regions: {
            buttons: '.crm-designer-buttonset-region',
            palette: '.crm-designer-palette-region',
            form: '.crm-designer-form-region',
            fields: '.crm-designer-fields-region'
        }
    });

    Civi.Designer.ToolbarView = Backbone.Marionette.ItemView.extend({
        serializeData: extendedSerializeData,
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
