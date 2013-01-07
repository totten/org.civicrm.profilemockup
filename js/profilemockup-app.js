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
      // Resize toolbar
      handleSize();
      $('.crm-designer-toolbar').resizable({
        handles: 'w',
        maxWidth: 400,
        minWidth: 150,
        resize: function(event, ui) {
          $('.crm-designer-canvas').css('margin-right', (ui.size.width + 10) + 'px');
          $(this).css({left: '', height: ''});
        }
      }).css({left: '', height: ''});
    };

    /**
     * Set height of palette
     */
    var handleSize = function() {
      var pos = $('.crm-designer-palette-tree').position();
      var div = $('#crm-designer').height();
      $('.crm-designer-palette-tree').css({height: div - pos.top});
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
          $("#crm-designer-dialog").block({message: 'Loading...', theme: true});
          var ufId = $('#test-profile-id').val();
          if (ufId) {
            // Retrieve UF group and fields from the api
            CRM.api('UFGroup', 'getsingle', {id: ufId, "api.UFField.get": 1}, {
              success: function(formData) {
                var ufFieldCollection = new CRM.UF.UFFieldCollection(_.values(formData["api.UFField.get"].values));
                // Note: With chaining, API returns some extraneous keys that aren't part of UFGroupModel
                var ufGroupModel = new CRM.UF.UFGroupModel(_.pick(formData, _.keys(CRM.UF.UFGroupModel.prototype.schema)));
                launchDesigner(ufGroupModel, ufFieldCollection);
              }
            });
          }
          else {
            // Initialize new UF group
            var ufGroupModel = new CRM.UF.UFGroupModel();
            var ufFieldCollection = new CRM.UF.UFFieldCollection();
            launchDesigner(ufGroupModel, ufFieldCollection);
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
