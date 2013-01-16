(function($) {
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
        model: this.model
      }));
      this.palette.show(new CRM.Designer.PaletteView({
        model: this.model
      }));
      this.form.show(new CRM.Designer.UFGroupView({
        model: this.model
      }));
      this.fields.show(new CRM.Designer.UFFieldCanvasView({
        model: this.model
      }));
    }
  });

  /**
   * Display toolbar with working button
   *
   * options:
   *  - model: CRM.UF.UFGroupModel
   */
  CRM.Designer.ToolbarView = Backbone.Marionette.ItemView.extend({
    serializeData: extendedSerializeData,
    template: '#designer_buttons_template',
    previewMode: false,
    events: {
      'click .crm-designer-save': 'doSave',
      'click .crm-designer-preview': 'doPreview'
    },
    onRender: function() {
      this.$('.crm-designer-save').button();
      this.$('.crm-designer-preview').button();
    },
    doSave: function(event) {
      if (this.model.getRel('ufFieldCollection').hasDuplicates()) {
        CRM.alert(ts('Please correct errors before saving.'), '', 'alert');
        return;
      }
      $('#crm-designer-dialog').block({message: 'Saving...', theme: true});
      var profile = this.model.toStrictJSON();
      profile["api.UFField.replace"] = {values: this.model.getRel('ufFieldCollection').toSortedJSON(), 'option.autoweight': 0, debug: 1};
      CRM.api('UFGroup', 'create', profile, {success: function(data) {
        $('#crm-designer-dialog').unblock().dialog('close');
      }});
    },
    doPreview: function(event) {
      this.previewMode = !this.previewMode;
      if (!this.previewMode) {
        $('.crm-designer-preview-canvas').html('');
        $('.crm-designer-canvas > *, .crm-designer-palette-region').show();
        $('.crm-designer-preview span').html(ts('Preview'));
        return;
      }
      if (this.model.getRel('ufFieldCollection').hasDuplicates()) {
        CRM.alert(ts('Please correct errors before previewing.'), '', 'alert');
        return;
      }
      $('#crm-designer-dialog').block({message: 'Loading...', theme: true});
      $.ajax({
        url: CRM.url("civicrm/ajax/inline"),
        type: 'POST',
        data: {
          'qfKey': CRM.profilePreviewKey,
          'class_name': 'CRM_Profilemockup_Form_Inline_Preview',
          'snippet': 1,
          'ufData': JSON.stringify({
            ufGroup: this.model.toStrictJSON(),
            ufFieldCollection: this.model.getRel('ufFieldCollection').toSortedJSON()
          })
        }
      }).done(function(data) {
        $('#crm-designer-dialog').unblock();
        $('.crm-designer-canvas > *, .crm-designer-palette-region').hide();
        $('.crm-designer-preview-canvas').html(data).show();
        $('.crm-designer-preview span').html(ts('Edit'));
      });
    }
  });

  /**
   * Display a selection of available fields
   *
   * options:
   *  - model: CRM.UF.UFGroupModel
   */
  CRM.Designer.PaletteView = Backbone.Marionette.ItemView.extend({
    serializeData: extendedSerializeData,
    template: '#palette_template',
    el: '<div class="full-height"></div>',
    events: {
      'keyup .crm-designer-palette-search input': 'doSearch',
      'click .crm-designer-palette-clear-search': 'clearSearch',
      'click .crm-designer-palette-refresh': 'doRefresh',
      'click .crm-designer-palette-toggle': 'toggleAll'
    },
    initialize: function() {
      this.model.getRel('ufFieldCollection')
        .on('add', this.toggleActive, this)
        .on('remove', this.toggleActive, this);
      this.model.getRel('paletteFieldCollection')
        .on('reset', this.render, this);
      CRM.designerApp.vent.on('resize', this.onResize, this);
    },
    onClose: function() {
      this.model.getRel('ufFieldCollection')
        .off('add', this.toggleActive, this)
        .off('remove', this.toggleActive, this);
      this.model.getRel('paletteFieldCollection')
        .off('reset', this.render, this);
      CRM.designerApp.vent.off('resize', this.onResize, this);
    },
    onRender: function() {
      var paletteView = this;

      // Prepare data for jstree
      var treeData = [];
      var sections = this.model.getRel('paletteFieldCollection').getSections();
      _.each(this.model.getRel('paletteFieldCollection').getFieldsByEntitySection(), function(values, key) {
        var items = [];
        _.each(values, function(paletteFieldModel, k) {
          items.push({data: paletteFieldModel.getLabel(), attr: {class: 'crm-designer-palette-field', "data-plm-cid": paletteFieldModel.cid}});
        });
        if (sections[key].is_addable) {
          items.push({data: 'placeholder', attr: {class: 'crm-designer-palette-add', 'data-section-key': key}});
        }
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
        $('.crm-designer-palette-field', this).draggable({
          appendTo: '#crm-designer',
          zIndex: $(this.$el).zIndex() + 5000,
          helper: 'clone',
          connectToSortable: '.crm-designer-fields' // FIXME: tight canvas/palette coupling
        });
        $('.crm-designer-palette-field', this).dblclick(function(event){
          var paletteFieldModel = paletteView.model.getRel('paletteFieldCollection').get($(event.currentTarget).attr('data-plm-cid'));
          paletteFieldModel.addToUFCollection(paletteView.model.getRel('ufFieldCollection'));
          event.stopPropagation();
        });
        paletteView.model.getRel('ufFieldCollection').each(function(ufFieldModel) {
          paletteView.toggleActive(ufFieldModel, paletteView.model.getRel('ufFieldCollection'))
        });
        paletteView.$('.crm-designer-palette-add a').remove();
        paletteView.$('.crm-designer-palette-add').append('<button>'+ts('Add Field')+'</button>');
        paletteView.$('.crm-designer-palette-add button').button()
          .click(function(event){
            var sectionKey = $(event.currentTarget).closest('.crm-designer-palette-add').attr('data-section-key');
            paletteView.doAddField(sectionKey);
            event.stopPropagation();
          })
        ;
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

      this.onResize();
    },
    onResize: function() {
      var pos = this.$('.crm-designer-palette-tree').position();
      var div = this.$('.crm-designer-palette-tree').closest('.crm-container').height();
      this.$('.crm-designer-palette-tree').css({height: div - pos.top});
    },
    doSearch: function(event) {
      $('.crm-designer-palette-tree').jstree("search", $(event.target).val());
    },
    doAddField: function(sectionKey) {
      var paletteView = this;
      var sections = this.model.getRel('paletteFieldCollection').getSections();
      var section = sections[sectionKey];
      var openAddNewWindow = function() {
        var url = CRM.url('civicrm/admin/custom/group/field/add', {
          reset: 1,
          action: 'add',
          gid: section.custom_group_id
        });
        window.open(url, '_blank');
      };

      if (paletteView.hideAddFieldAlert) {
        openAddNewWindow();
      } else {
        CRM.confirm({
          title: ts('Add Field'),
          message: ts('A new window or tab will open. Use the new window to add your field, and then return to this window and click "Refresh."'),
          onContinue: function() {
            paletteView.hideAddFieldAlert = true;
            openAddNewWindow();
          }
        });
      }
    },
    doRefresh: function(event) {
      var ufGroupModel = this.model;
      CRM.Schema.reloadModels()
        .done(function(data){
          ufGroupModel.resetEntities();
        })
        .fail(function() {
          CRM.alert(ts('Failed to retrieve schema'), ts('Error'), 'error');
        });
      return false;
    },
    clearSearch: function(event) {
      $('.crm-designer-palette-search input').val('').keyup();
      return false;
    },
    toggleActive: function(ufFieldModel, ufFieldCollection, options) {
      var paletteFieldCollection = this.model.getRel('paletteFieldCollection');
      var paletteFieldModel = paletteFieldCollection.getFieldByName(ufFieldModel.get('entity_name'), ufFieldModel.get('field_name'));
      var isAddable = ufFieldCollection.isAddable(ufFieldModel);
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
   */
  CRM.Designer.UFFieldCanvasView = Backbone.Marionette.View.extend({
    initialize: function() {
      this.model.getRel('ufFieldCollection')
        .on('add', this.updatePlaceholder, this)
        .on('remove', this.updatePlaceholder, this)
        .on('add', this.addUFFieldView, this);
    },
    onClose: function() {
      this.model.getRel('ufFieldCollection')
        .off('add', this.updatePlaceholder, this)
        .off('remove', this.updatePlaceholder, this)
        .off('add', this.addUFFieldView, this);
    },
    render: function() {
      var ufFieldCanvasView = this;
      this.$el.html(_.template($('#field_canvas_view_template').html()));

      // BOTTOM: Setup field-level editing
      var $fields = this.$('.crm-designer-fields');
      this.updatePlaceholder();
      var ufFieldModels = this.model.getRel('ufFieldCollection').sortBy(function(ufFieldModel) {
        return parseInt(ufFieldModel.get('weight'));
      });
      _.each(ufFieldModels, function(ufFieldModel) {
        ufFieldCanvasView.addUFFieldView(ufFieldModel, ufFieldCanvasView.model.getRel('ufFieldCollection'), {skipWeights: true});
      });
      this.$(".crm-designer-fields").sortable({
        placeholder: 'crm-designer-row-placeholder',
        forcePlaceholderSize: true,
        receive: function(event, ui) {
          var paletteFieldModel = ufFieldCanvasView.model.getRel('paletteFieldCollection').get(ui.item.attr('data-plm-cid'));
          var ufFieldModel = paletteFieldModel.addToUFCollection(
            ufFieldCanvasView.model.getRel('ufFieldCollection'),
            {skipWeights: true}
          );
          if (null == ufFieldModel) {
            ufFieldCanvasView.$('.crm-designer-fields .ui-draggable').remove();
          } else {
            // Move from end to the 'dropped' position
            var ufFieldViewEl = ufFieldCanvasView.$('div[data-field-cid='+ufFieldModel.cid+']').parent();
            ufFieldCanvasView.$('.crm-designer-fields .ui-draggable').replaceWith(ufFieldViewEl);
          }
          // note: the sortable() update callback will call updateWeight
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
        var ufFieldModel = ufFieldCanvasView.model.getRel('ufFieldCollection').get(ufFieldCid);
        ufFieldModel.set('weight', weight);
        weight++;
      });
    },
    addUFFieldView: function(ufFieldModel, ufFieldCollection, options) {
      var paletteFieldModel = this.model.getRel('paletteFieldCollection').getFieldByName(ufFieldModel.get('entity_name'), ufFieldModel.get('field_name'));
      var ufFieldView = new CRM.Designer.UFFieldView({
        el: $("<div></div>"),
        model: ufFieldModel,
        paletteFieldModel: paletteFieldModel
      });
      ufFieldView.render();
      this.$('.crm-designer-fields').append(ufFieldView.$el);
      if (! (options && options.skipWeights)) {
        this.updateWeights();
      }
    },
    updatePlaceholder: function() {
      if (this.model.getRel('ufFieldCollection').isEmpty()) {
        this.$('.placeholder').css({display: 'block', border: '0 none', cursor: 'default'});
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
        fieldSchema: this.model.getFieldSchema(),
        paletteFieldModel: this.options.paletteFieldModel
      }));
      this.detail.show(new CRM.Designer.UFFieldDetailView({
        model: this.model,
        fieldSchema: this.model.getFieldSchema()
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
      this.$el.toggleClass('crm-designer-open', this.expanded);
      this.detail.$el.toggle('blind', 250);
    },
    onChangeIsDuplicate: function(model, value, options) {
      this.$el.toggleClass('crm-designer-duplicate', value);
    },
    doRemove: function(event) {
      var that = this;
      this.$el.hide(250, function() {
        that.model.destroyLocal();
        that.remove();
      });
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
      var result = this.options.paletteFieldModel.getSection().title + ": " + this.options.paletteFieldModel.getLabel();
      if (this.options.fieldSchema.civiIsPhone) {
        result = result + '-' + CRM.PseudoConstant.phoneType[this.model.get('phone_type_id')];
      }
      if (this.options.fieldSchema.civiIsLocation) {
        var locType = this.model.get('location_type_id') ? CRM.PseudoConstant.locationType[this.model.get('location_type_id')] : ts('Primary');
        result = result + ' (' + locType + ')';
      }
      return result;
    },

    /**
     * Return a string marking if the field is required
     * @return {String}
     */
    getRequiredMarker: function() {
      if (this.model.get('is_required') == 1) {
        return ' <span class="crm-marker">*</span> ';
      }
      return '';
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
      var that = this;
      CRM.designerApp.vent.on('formOpened', function(event) {
        if (that.expanded && event !== 0) {
          that.doToggleForm(false);
        }
      });
    },
    doToggleForm: function(event) {
      this.expanded = !this.expanded;
      if (this.expanded && event !== false) {
        CRM.designerApp.vent.trigger('formOpened', 0);
      }
      this.$el.toggleClass('crm-designer-open', this.expanded);
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

})(cj);
