(function($) {
  var CRM = (window.CRM) ? (window.CRM) : (window.CRM = {});
  if (!CRM.ProfileSelector) CRM.ProfileSelector = {};

  CRM.ProfileSelector.Option = Backbone.Marionette.ItemView.extend({
    template: '#profile_selector_option_template',
    tagName: 'option',
    modelEvents: {
      'change:title': 'render'
    },
    onRender: function() {
      this.$el.attr('value', this.model.get('id'));
    }
  });

  CRM.ProfileSelector.Select = Backbone.Marionette.CollectionView.extend({
    tagName: 'select',
    itemView: CRM.ProfileSelector.Option
  });

  /**
   * Render a pane with 'Select/Preview/Edit/Copy/Create' functionality for profiles.
   *
   * Note: This view works with a ufGroupCollection, and it creates popups for a
   * ufGroupModel. These are related but not facilely. The ufGroupModels in the
   * ufGroupCollection are never passed to the popup, and the models from the
   * popup are never added to the collection. This is because the popup works
   * with temporary, local copies -- but the collection reflects the actual list
   * on the server.
   *
   * options:
   *  - ufGroupId: int, the default selection
   *  - ufGroupCollection: the profiles which can be selected
   *  - ufEntities: hard-coded entity list used with any new/existing forms
   *    (this may be removed when the form-runtime is updated to support hand-picking
   *    entities for each form)
   */
  CRM.ProfileSelector.View = Backbone.Marionette.Layout.extend({
    template: '#profile_selector_template',
    regions: {
      selectRegion: '.crm-profile-selector-select'
    },
    events: {
      'change .crm-profile-selector-select select': 'onChangeUfGroupId',
      'click .crm-profile-selector-preview': 'doPreview',
      'click .crm-profile-selector-edit': 'doEdit',
      'click .crm-profile-selector-copy': 'doCopy',
      'click .crm-profile-selector-create': 'doCreate'
    },
    /** @var Marionette.View which specifically builds on jQuery-UI's dialog */
    activeDialog: null,
    onRender: function() {
      var view = new CRM.ProfileSelector.Select({
        collection: this.options.ufGroupCollection
      });
      this.selectRegion.show(view);
      this.setUfGroupId(this.options.ufGroupId);
    },
    onChangeUfGroupId: function(event) {
      this.options.ufGroupId = $(event.target).val();
      this.trigger('change:ufGroupId', this);
    },
    setUfGroupId: function(value) {
      this.options.ufGroupId = value;
      this.$('.crm-profile-selector-select select').val(value);
    },
    getUfGroupId: function() {
      return this.options.ufGroupId;
    },
    doPreview: function() {
      var $pane = this.$('.crm-profile-selector-preview-pane');
      $pane.block({message: ts('Loading...'), theme: true});
      $.ajax({
        url: CRM.url("civicrm/ajax/inline"),
        type: 'GET',
        data: {
          class_name: 'CRM_Profilemockup_Form_Inline_PreviewById',
          id: this.getUfGroupId(),
          snippet: 5
        }
      }).done(function(data) {
        $pane
          .unblock()
          .html(data)
          .click(function() {
            return false; // disable buttons
          });
      });
    },
    doEdit: function() {
      var profileSelectorView = this;
      var designerDialog = new CRM.Designer.DesignerDialog({
        findCreateUfGroupModel: function(options) {
          var ufId = profileSelectorView.getUfGroupId();
          // Retrieve UF group and fields from the api
          CRM.api('UFGroup', 'getsingle', {id: ufId, "api.UFField.get": 1}, {
            success: function(formData) {
              // Note: With chaining, API returns some extraneous keys that aren't part of UFGroupModel
              var ufGroupModel = new CRM.UF.UFGroupModel(_.pick(formData, _.keys(CRM.UF.UFGroupModel.prototype.schema)));
              ufGroupModel.getRel('ufEntityCollection').reset(profileSelectorView.options.ufEntities);
              ufGroupModel.getRel('ufFieldCollection').reset(_.values(formData["api.UFField.get"].values));
              options.onLoad(ufGroupModel);
            }
          });
        }
      });
      designerDialog.on('close-dialog', this.onCloseDesignerDialog, this);
      this.setDialog(designerDialog);
    },
    doCopy: function() {
      // This is largely the same as doEdit, but we ultimately pass in a deepCopy of the ufGroupModel.
      var profileSelectorView = this;
      var designerDialog = new CRM.Designer.DesignerDialog({
        findCreateUfGroupModel: function(options) {
          var ufId = profileSelectorView.getUfGroupId();
          // Retrieve UF group and fields from the api
          CRM.api('UFGroup', 'getsingle', {id: ufId, "api.UFField.get": 1}, {
            success: function(formData) {
              // Note: With chaining, API returns some extraneous keys that aren't part of UFGroupModel
              var ufGroupModel = new CRM.UF.UFGroupModel(_.pick(formData, _.keys(CRM.UF.UFGroupModel.prototype.schema)));
              ufGroupModel.getRel('ufEntityCollection').reset(profileSelectorView.options.ufEntities);
              ufGroupModel.getRel('ufFieldCollection').reset(_.values(formData["api.UFField.get"].values));
              options.onLoad(ufGroupModel.deepCopy());
            }
          });
        }
      });
      designerDialog.on('close-dialog', this.onCloseDesignerDialog, this);
      this.setDialog(designerDialog);
    },
    doCreate: function() {
      var profileSelectorView = this;
      var designerDialog = new CRM.Designer.DesignerDialog({
        findCreateUfGroupModel: function(options) {
          // Initialize new UF group
          var ufGroupModel = new CRM.UF.UFGroupModel();
          ufGroupModel.getRel('ufEntityCollection').reset(profileSelectorView.options.ufEntities);
          options.onLoad(ufGroupModel);
        }
      });
      designerDialog.on('close-dialog', this.onCloseDesignerDialog, this);
      this.setDialog(designerDialog);
    },
    onCloseDesignerDialog: function(designerDialog) {
      var ufGroupId = designerDialog.model.get('id');
      if (!ufGroupId || designerDialog.isUfUnsaved) {
        // abandoned a new profile -- or abandoned a modified, existing profile
        return; // keep everything the same
      }
      var modelFromCollection = this.options.ufGroupCollection.get(ufGroupId);
      if (modelFromCollection) {
        // copy in changes to UFGroup
        modelFromCollection.set(designerDialog.model.toStrictJSON());
      } else {
        // add in new UFGroup
        modelFromCollection = new CRM.UF.UFGroupModel(designerDialog.model.toStrictJSON());
        this.options.ufGroupCollection.add(modelFromCollection);
      }
      this.setUfGroupId(ufGroupId);
      this.doPreview();
    },
    setDialog: function(view) {
      if (this.activeDialog) {
        this.activeDialog.close();
      }
      this.activeDialog = view;
      view.render();
    }
  });
})(cj);
