(function($) {
  var CRM = (window.CRM) ? (window.CRM) : (window.CRM = {});
  if (!CRM.ProfileSelector) CRM.ProfileSelector = {};

  CRM.ProfileSelector.View = Backbone.Marionette.ItemView.extend({
    template: '#profile_selector_template',
    events: {
      'click .crm-profile-selector-preview': 'doPreview',
      'click .crm-profile-selector-edit': 'doEdit',
      'click .crm-profile-selector-copy': 'doCopy',
      'click .crm-profile-selector-create': 'doCreate'
    },
    /** @var Marionette.View which specifically builds on jQuery-UI's dialog */
    activeDialog: null,
    onRender: function() {

    },
    doPreview: function() {
      console.log('doPreview');
    },
    doEdit: function() {
      console.log('doEdit');
      var designerDialog = new CRM.Designer.DesignerDialog({
        findCreateUfGroupModel: function(options) {
          var ufId = $('#test-profile-id').val();
          // Retrieve UF group and fields from the api
          CRM.api('UFGroup', 'getsingle', {id: ufId, "api.UFField.get": 1}, {
            success: function(formData) {
              // Note: With chaining, API returns some extraneous keys that aren't part of UFGroupModel
              var ufGroupModel = new CRM.UF.UFGroupModel(_.pick(formData, _.keys(CRM.UF.UFGroupModel.prototype.schema)));
              ufGroupModel.getRel('ufEntityCollection').reset([
                {entity_name: 'contact_1', entity_type: 'IndividualModel'},
                {entity_name: 'activity_1', entity_type: 'ActivityModel'}
              ]);
              ufGroupModel.getRel('ufFieldCollection').reset(_.values(formData["api.UFField.get"].values));
              options.onLoad(ufGroupModel);
            }
          });
        }
      });
      this.setDialog(designerDialog);
    },
    doCopy: function() {
      console.log('doCopy');
    },
    doCreate: function() {
      console.log('doCreate');
      var designerDialog = new CRM.Designer.DesignerDialog({
        findCreateUfGroupModel: function(options) {
          // Initialize new UF group
          var ufGroupModel = new CRM.UF.UFGroupModel();
          ufGroupModel.getRel('ufEntityCollection').reset([
            {entity_name: 'contact_1', entity_type: 'IndividualModel'},
            {entity_name: 'activity_1', entity_type: 'ActivityModel'}
          ]);
          options.onLoad(ufGroupModel);
        }
      });
      this.setDialog(designerDialog);
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
