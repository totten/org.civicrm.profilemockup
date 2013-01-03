(function() {
  var CRM = (window.CRM) ? (window.CRM) : (window.CRM = {});
  if (!CRM.Designer) CRM.Designer = {};

  /**
   * When rendering a template with Marionette.ItemView, the list of variables is determined by
   * serializeData(). The normal behavior is to map each property of this.model to a template
   * variable.
   *
   * This function extends that practice by exporting variables "_view", "_model", "_collection",
   * and "_options". This makes it easier for the template to, e.g., access computed properties of
   * a model (by calling "_model.getComputedProperty"), or to access constructor options (by
   * calling "_options.myoption").
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
   * Display a complete form-editing UI, including canvas, palette, and
   * buttons.
   *
   * options:
   *  - model: CRM.UF.UFGroupModel
   *  - ufFieldCollection: CRM.UF.UFFieldCollection
   *  - paletteFieldCollection: CRM.Designer.PaletteFieldCollection
   */
  CRM.Designer.DesignerLayout = Backbone.Marionette.Layout.extend({
    serializeData: extendedSerializeData,
    template: '#designer_template',
    regions: {
      buttons: '.crm-designer-buttonset-region',
      palette: '.crm-designer-palette-region',
      form: '.crm-designer-form-region',
      fields: '.crm-designer-fields-region'
    },
    onRender: function() {
      this.buttons.show(new CRM.Designer.ToolbarView({
        ufGroupModel: this.model,
        ufFieldCollection: this.options.ufFieldCollection
      }));
      this.palette.show(new CRM.Designer.PaletteView({
        model: this.options.paletteFieldCollection,
        ufFieldCollection: this.options.ufFieldCollection
      }));
      this.form.show(new CRM.Designer.UFGroupView({
        model: this.model
      }));
      this.fields.show(new CRM.Designer.UFFieldCanvasView({
        model: this.model,
        ufFieldCollection: this.options.ufFieldCollection,
        paletteFieldCollection: this.options.paletteFieldCollection
      }));
    }
  });

  /**
   * Display toolbar with working button
   *
   * options:
   *  - ufGroupModel: CRM.UF.UFGroupModel
   *  - ufFieldCollection: CRM.UF.UFFieldCollection
   */
  CRM.Designer.ToolbarView = Backbone.Marionette.ItemView.extend({
    serializeData: extendedSerializeData,
    template: '#designer_buttons_template',
    events: {
      'click .crm-designer-save': 'doSave',
      'click .crm-designer-preview': 'doPreview'
    },
    onRender: function() {
      this.$('.crm-designer-save').button();
      this.$('.crm-designer-preview').button();
    },
    doSave: function(event) {
      if (this.options.ufFieldCollection.hasDuplicates()) {
        CRM.alert(ts('Please correct errors before saving.'), '', 'alert');
        return;
      }
      $("#crm-designer-dialog").block({message: 'Saving...', theme: true});
      var profile = this.options.ufGroupModel.toStrictJSON();
      profile["api.UFField.replace"] = {values: this.options.ufFieldCollection.toSortedJSON()};
      CRM.api('UFGroup', 'create', profile, {success: function(data) {
        $("#crm-designer-dialog").unblock().dialog('close');
      }});
    },
    doPreview: function(event) {
      var toolbarView = this;
      if (this.options.ufFieldCollection.hasDuplicates()) {
        CRM.alert(ts('Please correct errors before previewing.'), '', 'alert');
        return;
      }
      var $dialog = $('<div><div class="crm-designer-preview-body crm-container"></div></div>');
      $dialog.appendTo('body');
      $dialog.dialog({
        autoOpen: true,
        title: 'Preview',
        width: '75%',
        height: 600,
        minWidth: 500,
        minHeight: 600,
        open: function() {
          $dialog.block({message: 'Loading...', theme: true});
          $.ajax({
            url: CRM.url("civicrm/profile-editor/preview?snippet=1"),
            type: 'POST',
            data: JSON.stringify({
              ufGroup: toolbarView.options.ufGroupModel.toStrictJSON(),
              ufFieldCollection: toolbarView.options.ufFieldCollection.toSortedJSON()
            })
          }).done(function(data) {
              $dialog.unblock();
              $dialog.find('.crm-designer-preview-body').html(data);
          });
        },
        close: function() {
          $dialog.remove();
        }
      });

    }
  });

  /**
   * Display a selection of available fields
   *
   * options:
   *  - model: CRM.Designer.PaletteFieldCollection
   *  - ufFieldCollection: CRM.UF.UFFieldCollection
   */
  CRM.Designer.PaletteView = Backbone.Marionette.ItemView.extend({
    serializeData: extendedSerializeData,
    template: '#palette_template',
    el: '<div class="full-height"></div>',
    events: {
      'keyup .crm-designer-palette-search input': 'doSearch',
      'click .crm-designer-palette-clear-search': 'clearSearch',
      'click .crm-designer-palette-controls a': 'toggleAll'
    },
    initialize: function() {
      this.options.ufFieldCollection.on('add', this.toggleActive, this);
      this.options.ufFieldCollection.on('remove', this.toggleActive, this);
    },
    onClose: function() {
      this.options.ufFieldCollection.off('add', this.toggleActive, this);
      this.options.ufFieldCollection.off('remove', this.toggleActive, this);
    },
    onRender: function() {
      var paletteView = this;

      // Prepare data for jstree
      var treeData = [];
      var sections = this.model.getSections();
      _.each(this.model.getFieldsByEntitySection(), function(values, key) {
        var items = [];
        _.each(values, function(vals, k) {
          items.push({data: vals.get('label'), attr: {"data-plm-cid": vals.cid}});
        });
        treeData.push({data: sections[key].title, children: items});
      });
      this.$('.crm-designer-palette-tree').jstree({
        'json_data': {data: treeData},
        'search': {
          'case_insensitive' : true,
          'show_only_matches': true
        },
        themes: {
          "theme": 'classic',
          "dots": false,
          "icons": false
        },
        'plugins': ['themes', 'json_data', 'ui', 'search']
      }).bind('loaded.jstree', function () {
        $('.jstree-leaf', this).draggable({
          appendTo: '#crm-designer',
          zIndex: $(this.$el).zIndex() + 5000,
          helper: 'clone',
          connectToSortable: '.crm-designer-fields' // FIXME: tight canvas/palette coupling
        });
        paletteView.options.ufFieldCollection.each(function(ufFieldModel) {
          paletteView.toggleActive(ufFieldModel, paletteView.options.ufFieldCollection)
        });
      }).bind("select_node.jstree", function (e, data) {
        $(this).jstree("toggle_node", data.rslt.obj);
        $(this).jstree("deselect_node", data.rslt.obj);
      });

      // FIXME: tight canvas/palette coupling
      this.$(".crm-designer-fields").droppable({
        activeClass: "ui-state-default",
        hoverClass: "ui-state-hover",
        accept: ":not(.ui-sortable-helper)"
      });
    },
    doSearch: function(event) {
      $('.crm-designer-palette-tree').jstree("search", $(event.target).val());
    },
    clearSearch: function(event) {
      $('.crm-designer-palette-search input').val('').keyup();
      return false;
    },
    toggleActive: function(ufFieldModel, ufFieldCollection, options) {
      var paletteFieldCollection = this.model;
      var paletteFieldModel = paletteFieldCollection.getFieldByName(ufFieldModel.get('entity_name'), ufFieldModel.get('field_name'));
      var isAddable = ufFieldCollection.isAddable(ufFieldModel.get('entity_name'), ufFieldModel.get('field_name'), paletteFieldModel.get('fieldSchema'));
      this.$('[data-plm-cid='+paletteFieldModel.cid+']').toggleClass('disabled', !isAddable);
    },
    toggleAll: function(event) {
      if ($('.crm-designer-palette-search input').val() == '') {
        $('.crm-designer-palette-tree').jstree($(event.target).attr('rel'));
      }
      return false;
    }
  });

  /**
   * Display all UFFieldModel objects in a UFGroupModel.
   *
   * options:
   *  - model: CRM.UF.UFGroupModel
   *  - ufFieldCollection: CRM.UF.UFFieldCollection
   *  - paletteFieldCollection: CRM.Designer.PaletteFieldCollection
   */
  CRM.Designer.UFFieldCanvasView = Backbone.Marionette.View.extend({
    initialize: function() {
      this.options.ufFieldCollection.on('add', this.updatePlaceholder, this);
      this.options.ufFieldCollection.on('remove', this.updatePlaceholder, this);
    },
    onClose: function() {
      this.options.ufFieldCollection.off('add', this.updatePlaceholder, this);
      this.options.ufFieldCollection.off('remove', this.updatePlaceholder, this);
    },
    render: function() {
      var ufFieldCanvasView = this;
      this.$el.html(_.template($('#field_canvas_view_template').html()));

      // BOTTOM: Setup field-level editing
      var $fields = this.$('.crm-designer-fields');
      this.updatePlaceholder();
      var ufFieldModels = this.options.ufFieldCollection.sortBy(function(ufFieldModel) {
        return ufFieldModel.get('weight');
      });
      _.each(ufFieldModels, function(ufFieldModel) {
        var paletteFieldModel = ufFieldCanvasView.options.paletteFieldCollection.getFieldByName(ufFieldModel.get('entity_name'), ufFieldModel.get('field_name'));
        var ufFieldView = new CRM.Designer.UFFieldView({
          el: $("<div></div>"),
          model: ufFieldModel,
          paletteFieldModel: paletteFieldModel
        });
        ufFieldView.render();
        ufFieldView.$el.appendTo($fields);
      });
      this.$(".crm-designer-fields").sortable({
        placeholder: 'crm-designer-row-placeholder',
        forcePlaceholderSize: true,
        receive: function(event, ui) {
          var paletteFieldModel = ufFieldCanvasView.options.paletteFieldCollection.getByCid(ui.item.attr('data-plm-cid'));
          var ufFieldModel = paletteFieldModel.createUFFieldModel();
          ufFieldModel.set('uf_group_id', ufFieldCanvasView.model.get('id'));
          var ufFieldCollection = ufFieldCanvasView.options.ufFieldCollection;
          if (!ufFieldCollection.isAddable(ufFieldModel.get('entity_name'), ufFieldModel.get('field_name'), ufFieldModel.getFieldSchema())) {
            CRM.alert(
              ts('The field "%1" is already included.', {
                1: paletteFieldModel.get('label')
              }),
              ts('Duplicate'),
              'alert'
            );
            ufFieldCanvasView.$('.crm-designer-fields .ui-draggable').remove();
            return;
          }
          ufFieldCollection.add(ufFieldModel);

          var ufFieldView = new CRM.Designer.UFFieldView({
            el: $("<div></div>"),
            model: ufFieldModel,
            paletteFieldModel: paletteFieldModel
          });
          ufFieldView.render();
          ufFieldCanvasView.$('.crm-designer-fields .ui-draggable').replaceWith(ufFieldView.$el);
        },
        update: function() {
          ufFieldCanvasView.updateWeights();
        }
      });
    },
    /** Determine visual order of fields and set the model values for "weight" */
    updateWeights: function() {
      var ufFieldCanvasView = this;
      var weight = 1;
      var rows = this.$('.crm-designer-row').each(function(key, row) {
        if ($(row).hasClass('placeholder')) {
          return;
        }
        var ufFieldCid = $(row).attr('data-field-cid');
        var ufFieldModel = ufFieldCanvasView.options.ufFieldCollection.getByCid(ufFieldCid);
        ufFieldModel.set('weight', weight);
        weight++;
      });
    },
    updatePlaceholder: function() {
      if (this.options.ufFieldCollection.isEmpty()) {
        this.$('.placeholder').show();
      } else {
        this.$('.placeholder').hide();
      }
    }
  });

  /**
   * options:
   * - model: CRM.UF.UFFieldModel
   * - paletteFieldModel: CRM.Designer.PaletteFieldModel
   */
  CRM.Designer.UFFieldView = Backbone.Marionette.Layout.extend({
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
    modelEvents: {
      "change:is_duplicate": 'onChangeIsDuplicate'
    },
    onRender: function() {
      this.summary.show(new CRM.Designer.UFFieldSummaryView({
        model: this.model,
        fieldSchema: this.options.paletteFieldModel.get('fieldSchema'),
        paletteFieldModel: this.options.paletteFieldModel
      }));
      this.detail.show(new CRM.Designer.UFFieldDetailView({
        model: this.model,
        fieldSchema: this.options.paletteFieldModel.get('fieldSchema'),
        paletteFieldModel: this.options.paletteFieldModel
      }));
      this.onChangeIsDuplicate(this.model, this.model.get('is_duplicate'))
      if (!this.expanded) {
        this.detail.$el.hide();
      }
      var that = this;
      CRM.designerApp.vent.on('formOpened', function(event) {
        if (that.expanded && event != that.cid) {
          that.doToggleForm(false);
        }
      });
    },
    doToggleForm: function(event) {
      this.expanded = !this.expanded;
      if (this.expanded && event !== false) {
        CRM.designerApp.vent.trigger('formOpened', this.cid);
      }
      this.detail.$el.toggle('blind', 250);
    },
    onChangeIsDuplicate: function(model, value, options) {
      this.$el.toggleClass('crm-designer-duplicate', value);
    },
    doRemove: function(event) {
      this.model.destroyLocal();
      this.remove();
    }
  });

  /**
   * options:
   * - model: CRM.UF.UFFieldModel
   * - fieldSchema: (Backbone.Form schema element)
   * - paletteFieldModel: CRM.Designer.PaletteFieldModel
   */
  CRM.Designer.UFFieldSummaryView = Backbone.Marionette.ItemView.extend({
    serializeData: extendedSerializeData,
    template: '#field_summary_template',
    modelEvents: {
      'change': 'render'
    },

    /**
     * Compose a printable string which describes the binding of this UFField to the data model
     * @return {String}
     */
    getBindingLabel: function() {
      var result = this.options.paletteFieldModel.getSection().title + ": " + this.options.paletteFieldModel.get('label');
      if (this.options.fieldSchema.civiIsPhone) {
        result = result + '-' + CRM.PseudoConstant.phoneType[this.model.get('phone_type_id')];
      }
      if (this.options.fieldSchema.civiIsLocation) {
        var locType = this.model.get('location_type_id') ? CRM.PseudoConstant.locationType[this.model.get('location_type_id')] : ts('Primary');
        result = result + ' (' + locType + ')';
      }
      return result;
    },

    onRender: function() {
      this.$el.toggleClass('disabled', this.model.get('is_active') != 1);
      if (this.model.get("is_reserved") == 1) {
        this.$('.crm-designer-buttons').hide();
      }
    }
  });

  /**
   * options:
   * - model: CRM.UF.UFFieldModel
   * - fieldSchema: (Backbone.Form schema element)
   * - paletteFieldModel: CRM.Designer.PaletteFieldModel
   */
  CRM.Designer.UFFieldDetailView = Backbone.View.extend({
    initialize: function() {
      // FIXME: hide/display 'in_selector' if 'visibility' is one of the public options
      var fields = ['location_type_id', 'phone_type_id', 'label', 'is_multi_summary', 'is_required', 'is_view', 'visibility', 'in_selector', 'is_searchable', 'help_pre', 'help_post', 'is_active'];
      if (! this.options.fieldSchema.civiIsLocation) {
        fields = _.without(fields, 'location_type_id');
      }
      if (! this.options.fieldSchema.civiIsPhone) {
        fields = _.without(fields, 'phone_type_id');
      }
      if (!this.options.fieldSchema.civiIsMultiple) {
        fields = _.without(fields, 'is_multi_summary');
      }

      this.form = new Backbone.Form({
        model: this.model,
        fields: fields
      });
      this.form.on('change', this.onFormChange, this);
    },
    render: function() {
      this.$el.html(this.form.render().el);
      this.onFormChange();
    },
    onFormChange: function() {
      this.form.commit();
      this.$('.field-is_multi_summary').toggle(this.options.fieldSchema.civiIsMultiple ? true : false);
      this.$('.field-in_selector').toggle(this.model.isInSelectorAllowed());
      // this.$(':input').attr('disabled', this.model.get("is_reserved") == 1);

      if (!this.model.isInSelectorAllowed() && this.model.get('in_selector') != "0") {
        this.model.set('in_selector', "0");
        this.form.setValue('in_selector', "0");
        // TODO: It might be nicer if we didn't completely discard in_selector -- e.g.
        // if the value could be restored when the user isInSelectorAllowed becomes true
        // again. However, I haven't found a simple way to do this.
      }
    }
  });

  /**
   * options:
   * - model: CRM.UF.UFGroupModel
   */
  CRM.Designer.UFGroupView = Backbone.Marionette.Layout.extend({
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
      this.summary.show(new CRM.Designer.UFGroupSummaryView({
        model: this.model
      }));
      this.detail.show(new CRM.Designer.UFGroupDetailView({
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
   * - model: CRM.UF.UFGroupModel
   */
  CRM.Designer.UFGroupSummaryView = Backbone.Marionette.ItemView.extend({
    serializeData: extendedSerializeData,
    template: '#form_summary_template',
    modelEvents: {
      'change': 'render'
    },
    onRender: function() {
      this.$el.toggleClass('disabled', this.model.get('is_active') != 1);
      if (this.model.get("is_reserved") == 1) {
        this.$('.crm-designer-buttons').hide();
      }
    }
  });

  /**
   * options:
   * - model: CRM.UF.UFGroupModel
   */
  CRM.Designer.UFGroupDetailView = Backbone.View.extend({
    initialize: function() {
      this.form = new Backbone.Form({
        model: this.model,
        fields: ['title', 'help_pre', 'help_post', 'is_active']
      });
      this.form.on('change', this.form.commit, this.form);
    },
    render: function() {
      this.$el.html(this.form.render().el);
    }
  });

})();
