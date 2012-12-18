cj(document).ready(function($) {
  { // placeholder to keep indentation
    CRM.designerApp = new Backbone.Marionette.Application();
    CRM.designerApp.addRegions({
      designerRegion: '#crm-designer-designer'
    });
    // Prepare data to pass into application
    var paletteFieldCollection = new Civi.Designer.PaletteFieldCollection();
    paletteFieldCollection.addEntity('contact_1', Civi.Core.IndividualModel);
    paletteFieldCollection.addEntity('activity_1', Civi.Core.ActivityModel);

    /**
     * Prepare application
     */
    var launchDesigner = function(ufGroupModel, ufFieldCollection) {
      window.tmpPaletteFieldCollection = paletteFieldCollection; // temporary; for debugging
      window.tmpUFGroupModel = ufGroupModel; // temporary; for debugging

      var designerLayout = new Civi.Designer.DesignerLayout({
        model: ufGroupModel,
        ufFieldCollection: ufFieldCollection,
        paletteFieldCollection: paletteFieldCollection
      });
      $("#crm-designer-dialog").unblock();
      CRM.designerApp.designerRegion.show(designerLayout);
    };

    $('.crm-designer-open').click(function() {
      // Open dialog
      $("#crm-designer-dialog").dialog({
        autoOpen: true, // note: affects accordion height
        title: 'Edit Profile',
        width: '75%',
        minWidth: 500,
        minHeight: 600,
        open: function() {
          $("#crm-designer-dialog").block({message: 'Loading...', theme: true});
          var ufId = $('#test-profile-id').val();
          if (ufId) {
            // Retrieve UF group and fields from the api
            CRM.api('UFGroup', 'getsingle', {id: ufId, "api.UFField.get": 1}, {
              success: function(formData) {
                var ufFieldCollection = new Civi.UF.UFFieldCollection(_.values(formData["api.UFField.get"].values));
                var ufGroupModel = new Civi.UF.UFGroupModel(formData);
                launchDesigner(ufGroupModel, ufFieldCollection);
              }
            });
          }
          else {
            // Initialize new UF group
            var formData = {};
            formData.ufFieldCollection = new Civi.UF.UFFieldCollection();
            var ufGroupModel = new Civi.UF.UFGroupModel(formData);
            launchDesigner(ufGroupModel);
          }
        },
        close: function() {
          CRM.designerApp.designerRegion.close();
        }
      });
    });
  }
});
