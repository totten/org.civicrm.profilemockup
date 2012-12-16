cj(document).ready(function($) {
  { // placeholder to keep indentation
    var designerApp = new Backbone.Marionette.Application();
    designerApp.addRegions({
      designerRegion: '#crm-designer-designer'
    });
    // Prepare data to pass into application
    var paletteFieldCollection = new Civi.Designer.PaletteFieldCollection();
    paletteFieldCollection.addEntity('contact_1', Civi.Core.IndividualModel);
    paletteFieldCollection.addEntity('activity_1', Civi.Core.ActivityModel);

    var launchDesigner = function(formModel) {
      window.tmpPaletteFieldCollection = paletteFieldCollection; // temporary; for debugging
      window.tmpFormModel = formModel; // temporary; for debugging

      // Prepare application
      $("#crm-designer-dialog").dialog({
        autoOpen: true, // note: affects accordion height
        title: formModel.attributes.title || 'New Profile',
        width: '75%',
        minWidth: 500,
        minHeight: 600,
        open: function() {
          var designerLayout = new Civi.Designer.DesignerLayout({
            model: formModel,
            paletteFieldCollection: paletteFieldCollection
          });
          designerApp.designerRegion.show(designerLayout);
        },
        close: function() {
          designerApp.designerRegion.close();
        }
      });
    };

    $('.crm-designer-open').click(function() {
      var ufId = $('#test-profile-id').val();
      if (ufId) {
        // Retrieve UF group and fields from the api
        CRM.api('UFGroup', 'getsingle', {id: ufId}, {success: function(data) {
          var formData = data;
          CRM.api('UFField', 'get', {uf_group_id: ufId}, {success: function(data) {
            formData.fieldCollection = new Civi.Form.FieldCollection(_.values(data.values));
            var formModel = new Civi.Form.FormModel(formData);
            launchDesigner(formModel);
          }
          });
        }
        });
      }
      else {
        // Initialize new UF group
        var formData = {};
        formData.fieldCollection = new Civi.Form.FieldCollection();
        var formModel = new Civi.Form.FormModel(formData);
        launchDesigner(formModel);
      }
    });
  }
});
