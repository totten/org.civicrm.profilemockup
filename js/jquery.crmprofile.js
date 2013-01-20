(function($) {
  var ufGroupCollection = new CRM.UF.UFGroupCollection(CRM.initialProfileList.values);
  /**
   * Example:
   * <input type="text" value="{$profileId}"
   *   class="crm-profile-selector"
   *   data-group-type="Contact,Individual,Activity;;ActivityType:7"
   *   data-entities="contact_1:IndividualModel,activity_1:ActivityModel"
   *   />
   *
   * Note: The system does not currently support dynamic entities -- it only supports
   * a couple of entities named "contact_1" and "activity_1". See also
   * CRM.UF.guessEntityName().
   */
  $('.crm-profile-selector').each(function() {
    // Hide the existing <SELECT> and instead construct a ProfileSelector view.
    // Keep them synchronized.
    var select = this;

    var validUfTypesExpr = $(this).attr('data-group-type');
    // var validUfTypesExpr = 'Individual,Contact,Activity\0ActivityType:28';
    var matchingUfGroups;
    if (validUfTypesExpr) {
       matchingUfGroups = ufGroupCollection.subcollection({
        filter: function(ufGroupModel) {
          return ufGroupModel.checkGroupType(validUfTypesExpr);
        }
      });
    } else {
      matchingUfGroups = ufGroupCollection;
    }

    var ufEntities = [];
    _.each($(select).attr('data-entities').split(','), function(binding){
      var bindingParts = binding.split(':');
      ufEntities.push({entity_name: bindingParts[0], entity_type: bindingParts[1]});
    });

    var view = new CRM.ProfileSelector.View({
      ufGroupId: $(select).val(),
      ufGroupCollection: matchingUfGroups,
      ufEntities: ufEntities
    });
    view.on('change:ufGroupId', function() {
      $(select).val(view.getUfGroupId());
    })
    view.render();
    $(select).after(view.el);
    setTimeout(function(){view.doPreview();}, 100);
  });
})(cj);
