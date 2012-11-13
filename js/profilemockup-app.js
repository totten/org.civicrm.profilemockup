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
        paletteFieldCollection.addEntity('contact', Civi.Core.IndividualModel);
        paletteFieldCollection.addEntity('act', Civi.Core.ActivityModel);

        var formModel = new Civi.Form.FormModel({
            id: 5,
            title: 'October Survey',
            help_post: (new Date()).toString(),
            fieldCollection: new Civi.Form.FieldCollection()
        });

        // temporary; for debugging
        window.paletteFieldCollection = paletteFieldCollection;
        window.formModel = formModel;

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
