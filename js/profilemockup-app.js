cj(document).ready(function($) {
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
  }

  { // placeholder to keep indentation
    // FIXME we depend on this being a global singleton, mainly to facilitate vents
    CRM.designerApp = new Backbone.Marionette.Application();
    CRM.designerApp.addRegions({
      designerRegion: '#crm-designer'
    });

    var undoState = false;
    var undoAlert;
    window.onbeforeunload = function() {
      if (CRM.Designer.isDialogOpen && CRM.Designer.isModified) {
        return ts("Your profile has not been saved.");
      }
    };

    $('.crm-designer-open').click(function() {
      // Open dialog
      $("#crm-designer-dialog").dialog({
        autoOpen: true, // note: affects accordion height
        title: 'Edit Profile',
        width: '75%',
        height: 600,
        minWidth: 500,
        minHeight: 600, // to allow dropping in big whitespace, coordinate with min-height of .crm-designer-fields
        open: function() {
          undoAlert && undoAlert.close && undoAlert.close();
          CRM.Designer.isDialogOpen = true;
          if (undoState === false) {
            CRM.designerApp.designerRegion && CRM.designerApp.designerRegion.close && CRM.designerApp.designerRegion.close();
            $("#crm-designer-dialog").block({message: 'Loading...', theme: true});
            $('.ui-dialog-titlebar-close').unbind('click').click(function() {
              undoAlert && undoAlert.close && undoAlert.close();
              if (CRM.Designer.isModified) {
                undoAlert = CRM.alert('<a href="#" class="crm-undo">' + ts('Undo discard') + '</a>', ts('Changes Discarded'), 'alert', {expires: 20000});
                $('.ui-notify-message a.crm-undo').click(function() {
                  undoState = true;
                  $("#crm-designer-dialog").dialog('open');
                  return false;
                });
              }
              $("#crm-designer-dialog").dialog('close');
              return false;
            });
            findCreateUfGroupModel({
              onLoad: function(ufGroupModel) {
                var designerLayout = new CRM.Designer.DesignerLayout({
                  model: ufGroupModel,
                  el: '<div class="full-height"></div>'
                });
                $("#crm-designer-dialog").unblock();
                CRM.designerApp.designerRegion.show(designerLayout);
                CRM.designerApp.vent.trigger('resize');
                CRM.Designer.isModified = false;
              }
            });
          }
          undoState = false;
        },
        close: function() {
          CRM.Designer.isDialogOpen = false;
        },
        resize: function() {
          CRM.designerApp.vent.trigger('resize');
        }
      });
    });
  }
});
