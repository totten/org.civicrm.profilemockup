cj(document).ready(function($) {
  { // placeholder to keep indentation
    CRM.designerApp = new Backbone.Marionette.Application();
    CRM.designerApp.addRegions({
      designerRegion: '#crm-designer'
    });
    // Prepare data to pass into application
    var paletteFieldCollection = new CRM.Designer.PaletteFieldCollection();
    paletteFieldCollection.addEntity('contact_1', CRM.CoreModel.IndividualModel);
    paletteFieldCollection.addEntity('activity_1', CRM.CoreModel.ActivityModel);

    /**
     * Prepare application
     */
    var launchDesigner = function(ufGroupModel, ufFieldCollection) {
      window.tmpPaletteFieldCollection = paletteFieldCollection; // temporary; for debugging
      window.tmpUFGroupModel = ufGroupModel; // temporary; for debugging

      var designerLayout = new CRM.Designer.DesignerLayout({
        model: ufGroupModel,
        el: '<div class="full-height"></div>',
        ufFieldCollection: ufFieldCollection,
        paletteFieldCollection: paletteFieldCollection
      });
      $("#crm-designer-dialog").unblock();
      CRM.designerApp.designerRegion.show(designerLayout);
      handleSize();
    };

    var handleSize = function() {
      var pos = $('.crm-designer-palette-tree').position();
      var cont = $('#crm-designer').height();
      var height = cont - pos.top;
      $('.crm-designer-palette-tree').css({height: height});
    }

    $('.crm-designer-open').click(function() {
      // Open dialog
      $("#crm-designer-dialog").dialog({
        autoOpen: true, // note: affects accordion height
        title: 'Edit Profile',
        width: '75%',
        height: 600,
        minWidth: 500,
        minHeight: 600,
        open: function() {
          $("#crm-designer-dialog").block({message: 'Loading...', theme: true});
          var ufId = $('#test-profile-id').val();
          if (ufId) {
            // Retrieve UF group and fields from the api
            CRM.api('UFGroup', 'getsingle', {id: ufId, "api.UFField.get": 1}, {
              success: function(formData) {
                var ufFieldCollection = new CRM.UF.UFFieldCollection(_.values(formData["api.UFField.get"].values));
                var ufGroupModel = new CRM.UF.UFGroupModel(formData);
                launchDesigner(ufGroupModel, ufFieldCollection);
              }
            });
          }
          else {
            // Initialize new UF group
            var formData = {};
            formData.ufFieldCollection = new CRM.UF.UFFieldCollection();
            var ufGroupModel = new CRM.UF.UFGroupModel(formData);
            launchDesigner(ufGroupModel);
          }
        },
        close: function() {
          CRM.designerApp.designerRegion.close();
        },
        resize: handleSize
      });
    });
  }
});
