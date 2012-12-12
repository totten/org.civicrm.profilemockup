cj(document).ready(function($){
    { // placeholder to keep indentation
        var designerApp = new Backbone.Marionette.Application();
        designerApp.addRegions({
            designerRegion: '#crm-designer-designer'
        });

        // Prepare data to pass into application
        var paletteFieldCollection = new Civi.Designer.PaletteFieldCollection();
        paletteFieldCollection.addEntity('contact_1', Civi.Core.IndividualModel);
        paletteFieldCollection.addEntity('activity_1', Civi.Core.ActivityModel);

        var formData = _.clone(CRM.form);
        formData.fieldCollection = new Civi.Form.FieldCollection(_.values(CRM.formFieldCollection.values));
        var formModel = new Civi.Form.FormModel(formData);

        window.tmpPaletteFieldCollection = paletteFieldCollection; // temporary; for debugging
        window.tmpFormModel = formModel; // temporary; for debugging

        // Prepare application
        var designerView = null; // Civi.Form.DesignerView
        $("#crm-designer-dialog").dialog({
            autoOpen: true, // note: affects accordion height
            title: 'Embedded Profile Editor',
            width: '75%',
            minWidth: 400,
            minHeight: 600,
            open: function() {
                designerView = new Civi.Designer.DesignerView({
                    model: formModel,
                    paletteFieldCollection: paletteFieldCollection
                });
                designerApp.designerRegion.show(designerView);
                window.tmpDesignerView = designerView; // temporary; for debugging
                window.tmpDesignerRegion = designerApp.designerRegion;
            },
            close: function() {
                designerView.destroy();
                designerView.remove();
            }
        });
        $('.crm-designer-open').click(function(event){
            $("#crm-designer-dialog").dialog('open');
        });
    }
});
