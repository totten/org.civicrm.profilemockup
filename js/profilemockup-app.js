cj(document).ready(function($) {
  { // placeholder to keep indentation
    // FIXME we depend on this being a global singleton, mainly to facilitate vents
    CRM.designerApp = new Backbone.Marionette.Application();
    CRM.designerApp.addRegions({
      designerRegion: '#crm-designer'
    });
  }
});
