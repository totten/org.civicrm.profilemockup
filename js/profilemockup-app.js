cj(document).ready(function($){

    // Router
    var AppRouter = Backbone.Router.extend({
        routes: {
            '*actions': 'defaultRoute'
        }
    });
    var app_router = new AppRouter();
    app_router.on('route:defaultRoute', function(name) {
        var paletteFieldCollection = new Civi.Designer.PaletteFieldCollection();
        paletteFieldCollection.addEntity(Civi.Core.ContactModel.prototype.ENTITY_NAME, Civi.Core.ContactModel);
        paletteFieldCollection.addEntity(Civi.Core.IndividualModel.prototype.ENTITY_NAME, Civi.Core.IndividualModel);
        paletteFieldCollection.addEntity(Civi.Core.ActivityModel.prototype.ENTITY_NAME, Civi.Core.ActivityModel);

        var formModel = new Civi.Form.FormModel({
            id: 5,
            title: 'October Survey',
            help_post: (new Date()).toString(),
            fieldCollection: new Civi.Form.FieldCollection()
        });

        window.tmpPaletteFieldCollection = paletteFieldCollection; // temporary; for debugging
        window.tmpFormModel = formModel; // temporary; for debugging

        var designerView = null; // Civi.Form.DesignerView
        $("#crm-designer-dialog").dialog({
            autoOpen: true, // note: affects accordion height
            title: 'Embedded Profile Editor',
            width: '75%',
            minWidth: 400,
            minHeight: 400,
            open: function() {
                var div = $('<div></div>').appendTo($('#crm-designer-designer'));
                designerView = new Civi.Designer.DesignerView({
                    model: formModel,
                    paletteFieldCollection: paletteFieldCollection,
                    el: div
                });
                window.tmpDesignerView = designerView; // temporary; for debugging
            },
            close: function() {
                designerView.destroy();
                designerView.remove();
            }
        });
        $('.crm-designer-open').click(function(event){
            $("#crm-designer-dialog").dialog('open');
        });
    });
    Backbone.history.start();
});
