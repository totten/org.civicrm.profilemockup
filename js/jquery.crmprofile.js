(function($) {
  var ufGroupCollection = new CRM.UF.UFGroupCollection(CRM.initialProfileList.values);
  $('.crm-profile-selector').each(function() {
    // Hide the existing <SELECT> and instead construct a ProfileSelector view.
    // Keep them synchronized.
    var select = this;

    var view = new CRM.ProfileSelector.View({
      ufGroupId: $(select).val(),
      ufGroupCollection: ufGroupCollection,
      ufEntities: [
        {entity_name: 'contact_1', entity_type: 'IndividualModel'},
        {entity_name: 'activity_1', entity_type: 'ActivityModel'}
      ]
    });
    view.on('change:ufGroupId', function() {
      $(select).val(view.getUfGroupId());
    })
    view.render();
    $(select).after(view.el);
    setTimeout(function(){view.doPreview();}, 100);
  });
})(cj);
