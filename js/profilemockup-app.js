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

    var launchDesigner = function(ufGroupModel, ufFieldCollection) {
      window.tmpPaletteFieldCollection = paletteFieldCollection; // temporary; for debugging
      window.tmpUFGroupModel = ufGroupModel; // temporary; for debugging

      // Prepare application
      $("#crm-designer-dialog").dialog({
        autoOpen: true, // note: affects accordion height
        title: ufGroupModel.attributes.title || 'New Profile',
        width: '75%',
        minWidth: 500,
        minHeight: 600,
        open: function() {
          var designerLayout = new Civi.Designer.DesignerLayout({
            model: ufGroupModel,
            ufFieldCollection: ufFieldCollection,
            paletteFieldCollection: paletteFieldCollection
          });
          CRM.designerApp.designerRegion.show(designerLayout);
        },
        close: function() {
          CRM.designerApp.designerRegion.close();
        }
      });
    };

    $('.crm-designer-open').click(function() {
      var ufId = $('#test-profile-id').val();
      if (ufId) {
        // Retrieve UF group and fields from the api
        CRM.api('UFGroup', 'getsingle', {id: ufId}, {success: function(formData) {
          CRM.api('UFField', 'get', {uf_group_id: ufId}, {success: function(data) {
            var ufFieldCollection = new Civi.UF.UFFieldCollection(_.values(data.values));
            var ufGroupModel = new Civi.UF.UFGroupModel(formData);
            launchDesigner(ufGroupModel, ufFieldCollection);
          }
          });
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
    });
  }
});
