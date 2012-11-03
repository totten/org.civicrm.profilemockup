cj(document).ready(function($){

    // Router
    var AppRouter = Backbone.Router.extend({
        routes: {
            '*actions': 'defaultRoute'
        }
    });
    var app_router = new AppRouter();
    app_router.on('route:defaultRoute', function(name) {

        var formFieldModel = Civi.Form.createFormFieldModel(Civi.Core.IndividualModel, 'last_name');
        var formFieldDetailView = new Civi.Form.FieldDetailView({
            el: $("#profile_editor_app"),
            model: formFieldModel
        });
        // var formModel = new Civi.Form.FormModel({id: 5, title: 'October Survey'});

        $("#crm-profilemockup-dialog").dialog({
            autoOpen: true, // note: affects accordion height
            title: 'Embedded Profile Editor',
            width: '95%',
            minHeight: 400,
            create: function() { 
                $('.crm-profilemockup-save').button({
                }).click(function(event){
                  console.log('save');
                });
                $('.crm-profilemockup-preview').button({
                }).click(function(event){
                  console.log('preview');
                });
                $('.crm-profilemockup-cancel').button({
                }).click(function(event){
                  console.log('cancel');
                });
            },
            open: function() {
                // Setup accordion after open to ensure proper height
                var palette_template = _.template( $('#palette_template').html() );
                $('.crm-profilemockup-palette').append(palette_template);
                $('.crm-profilemockup-palette').accordion({
                    heightStyle: 'fill',
                    autoHeight: true
                });
            },
            close: function() {
                console.log('close');
                $('.crm-profilemockup-palette').accordion('destroy');
            }
        });
        $('.crm-profilemockup-open').click(function(event){
            $("#crm-profilemockup-dialog").dialog('open');
        });
    });
    Backbone.history.start();
});
