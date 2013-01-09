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
    paletteFieldCollection.sync = function(method, model, options) {
      options || (options = {});
      console.log(method, model, options);
      switch (method) {
        case 'read':
          var newPFC = new CRM.Designer.PaletteFieldCollection();
          newPFC.addEntity('contact_1', CRM.CoreModel.IndividualModel);
          newPFC.addEntity('activity_1', CRM.CoreModel.ActivityModel);

          var success = options.success;
          options.success = function(resp, status, xhr) {
            if (success) success(resp, status, xhr);
            model.trigger('sync', model, resp, options);
          };
          success(newPFC.models);

          break;
        case 'create':
        case 'update':
        case 'delete':
        default:
          throw 'Unsupported method: ' + method;
      }
    };

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
      CRM.designerApp.vent.trigger('resize');
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
                // Note: With chaining, API returns some extraneous keys that aren't part of UFGroupModel
                var ufGroupModel = new CRM.UF.UFGroupModel(_.pick(formData, _.keys(CRM.UF.UFGroupModel.prototype.schema)));
                ufGroupModel.get('ufFieldCollection').reset(_.values(formData["api.UFField.get"].values));
                launchDesigner(ufGroupModel, ufGroupModel.get('ufFieldCollection'));
              }
            });
          }
          else {
            // Initialize new UF group
            var ufGroupModel = new CRM.UF.UFGroupModel();
            launchDesigner(ufGroupModel, ufGroupModel.get('ufFieldCollection'));
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
