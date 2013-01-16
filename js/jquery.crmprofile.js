(function($) {
  $('select.crm-profile-selector').each(function() {
    console.log('found ', this);
    var select = this;

    var dummyModel = new CRM.ProfileSelector.DummyModel({
      profile_id: $(select).val()
    });
    $(select).on('change', function(){
      dummyModel.set('profile_id', $(select).val());
    });

    var view = new CRM.ProfileSelector.View(dummyModel);
    view.render();
    $(select).after(view.el);
  });
})(cj);
