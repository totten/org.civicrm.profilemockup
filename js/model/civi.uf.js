(function() {
  var Civi = (window.Civi) ? (window.Civi) : (window.Civi = {});
  if (!Civi.UF) Civi.UF = {};

  var YESNO = [
    {val: 0, label: ts('No')},
    {val: 1, label: ts('Yes')}
  ];

  /**
   * This function is a hack for generating simulated values of "entity_name"
   * in the form-field model.
   *
   * @param {string} field_type
   * @return {string}
   */
  Civi.UF.guessEntityName = function(field_type) {
    switch (field_type) {
      case 'Contact':
      case 'Individual':
      case 'Organization':
        return 'contact_1';
      case 'Activity':
        return 'activity_1';
      default:
        throw "Cannot guess entity name for field_type=" + field_type;
    }
  }

  /**
   * Represents a field in a customizable form.
   */
  Civi.UF.UFFieldModel = Backbone.Model.extend({
    schema: {
      'id': {type: 'Number'},
      'uf_group_id': {type: 'Number'},
      'label': {type: 'Text'},
      'entity_name': {type: 'Text'}, // pseudo-field
      'field_type': {type: 'Select', options: ['Contact', 'Individual', 'Organization', 'Contribution', 'Membership', 'Participant', 'Activity']},
      'field_name': {type: 'Text'},
      'is_active': {type: 'Select', options: YESNO},
      'is_view': {type: 'Select', options: YESNO},
      'is_required': {type: 'Select', options: YESNO},
      'weight': {type: 'Number'},
      'help_post': {type: 'Text'},
      'help_pre': {type: 'Text'},
      'visibility': {type: 'Select', options: ['User and User Admin Only', 'Public Pages', 'Public Pages and Listings']},
      'in_selector': {type: 'Select', options: YESNO},
      'is_searchable': {type: 'Select', options: YESNO},
      'location_type_id': {type: 'Number'},
      'phone_type_id': {type: 'Number'},
      'is_reserved': {type: 'Select', options: YESNO},
      'is_multi_summary': {type: 'Select', options: YESNO}
    },
    initialize: function() {
      this.set('entity_name', Civi.UF.guessEntityName(this.get('field_type')));
    }
  });

  /**
   * Represents a list of fields in a customizable form
   */
  Civi.UF.UFFieldCollection = Backbone.Collection.extend({
    model: Civi.UF.UFFieldModel,
    initialize: function() {
    }
  });

  /**
   * Represents a customizable form
   *
   * options:
   *  - ufFieldCollection: Civi.UF.UFFieldCollection
   */
  Civi.UF.UFGroupModel = Backbone.Model.extend({
    schema: {
      'id': {type: 'Number'},
      'title': {type: 'Text'},
      'is_active': {type: 'Select', options: YESNO},
      'help_pre': {type: 'Text'},
      'help_post': {type: 'Text'}
      // TODO
    },
    initialize: function() {
    }
  });
})();