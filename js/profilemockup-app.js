cj(document).ready(function($){

    // Router
    var AppRouter = Backbone.Router.extend({
        routes: {
            '*actions': 'defaultRoute'
        }
    });
    var app_router = new AppRouter();
    app_router.on('route:defaultRoute', function(name) {
        var designerView = null; // Civi.Form.DesignerView
        $("#crm-designer-dialog").dialog({
            autoOpen: true, // note: affects accordion height
            title: 'Embedded Profile Editor',
            width: '95%',
            minHeight: 400,
            open: function() {
                var div = $('<div></div>').appendTo($('#crm-designer-designer'));
                designerView = new Civi.Designer.DesignerView({
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
