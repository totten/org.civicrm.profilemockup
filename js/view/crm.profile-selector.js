(function($) {
  var CRM = (window.CRM) ? (window.CRM) : (window.CRM = {});
  if (!CRM.ProfileSelector) CRM.ProfileSelector = {};

  var findCreateUfGroupModel = function(options) {
    var ufId = $('#test-profile-id').val();
    if (ufId) {
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
    else {
      // Initialize new UF group
      var ufGroupModel = new CRM.UF.UFGroupModel();
      ufGroupModel.getRel('ufEntityCollection').reset([
        {entity_name: 'contact_1', entity_type: 'IndividualModel'},
        {entity_name: 'activity_1', entity_type: 'ActivityModel'}
      ]);
      options.onLoad(ufGroupModel);
    }
  };

  var designerDialog = null;

  CRM.ProfileSelector.View = Backbone.Marionette.ItemView.extend({
    template: '#profile_selector_template',
    events: {
      'click .crm-profile-selector-preview': 'doPreview',
      'click .crm-profile-selector-edit': 'doEdit',
      'click .crm-profile-selector-copy': 'doCopy',
      'click .crm-profile-selector-create': 'doCreate'
    },
    onRender: function() {

    },
    doPreview: function() {
      console.log('doPreview');
    },
    doEdit: function() {
      console.log('doEdit');
      if (designerDialog) {
        // we may have kept it around to facilitate undo, but it's moot now
        designerDialog.close();
      }
      designerDialog = new CRM.Designer.DesignerDialog({
        findCreateUfGroupModel: findCreateUfGroupModel
      });
      designerDialog.render();
    },
    doCopy: function() {
      console.log('doCopy');
    },
    doCreate: function() {
      console.log('doCreate');
    }
  });
})(cj);
