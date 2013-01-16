(function($) {
  var CRM = (window.CRM) ? (window.CRM) : (window.CRM = {});
  if (!CRM.ProfileSelector) CRM.ProfileSelector = {};

  CRM.ProfileSelector.View = Backbone.Marionette.ItemView.extend({
    template: '#profile_selector_template',
    events: {
      'click .crm-profile-selector-preview': 'doPreview',
      'click .crm-profile-selector-edit': 'doEdit',
      'click .crm-profile-selector-copy': 'doCopy',
      'click .crm-profile-selector-create': 'doCreate'
    },
    onRender: function() {

    },
    doPreview: function() {
      console.log('doPreview');
    },
    doEdit: function() {
      console.log('doEdit');
    },
    doCopy: function() {
      console.log('doCopy');
    },
    doCreate: function() {
      console.log('doCreate');
    }
  });
})(cj);
