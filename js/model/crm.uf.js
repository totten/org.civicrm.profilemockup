(function() {
  var CRM = (window.CRM) ? (window.CRM) : (window.CRM = {});
  if (!CRM.UF) CRM.UF = {};

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
  CRM.UF.guessEntityName = function(field_type) {
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
  CRM.UF.UFFieldModel = Backbone.Model.extend({
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
      this.set('entity_name', CRM.UF.guessEntityName(this.get('field_type')));
    },

    /**
     * This is like destroy(), but it only destroys the item on the client-side;
     * it does not trigger REST or Backbone.sync() operations.
     *
     * @return {Boolean}
     */
    destroyLocal: function() {
      this.trigger('destroy', this, this.collection, {});
      return false;
    }
  });

  /**
   * Represents a list of fields in a customizable form
   */
  CRM.UF.UFFieldCollection = Backbone.Collection.extend({
    model: CRM.UF.UFFieldModel,
    initialize: function() {
    },
    getFieldByName: function(entityName, fieldName) {
      return this.find(function(ufFieldModel) {
        return (ufFieldModel.get('entity_name') == entityName && ufFieldModel.get('field_name') == fieldName);
      });
    },
    toSortedJSON: function() {
      var fields = _.pluck(this.models, 'attributes');
      // Why call 'attributes' instead of 'toJSON'
      return _.sortBy(fields, 'weight');
    },
    isAddable: function(ufFieldModel) {
      if (this.getFieldByName(ufFieldModel.get('entity_name'), ufFieldModel.get('field_name'))) {
        return false;
      } else {
        return true;
      }
    }
  });

  /**
   * Represents a customizable form
   */
  CRM.UF.UFGroupModel = Backbone.Model.extend({
    schema: {
      'id': {type: 'Number'},
      'name': {type: 'Text'},
      'title': {type: 'Text'},
      'group_type': {type: 'Text'},

      'add_captcha': {type: 'Select', options: YESNO},
      'add_to_group_id': {type: 'Number'},
      'cancel_URL': {type: 'Text'},
      'created_date': {type: 'Text'}, // FIXME
      'created_id': {type: 'Number'},
      'help_post': {type: 'TextArea'},
      'help_pre': {type: 'TextArea'},
      'is_active': {type: 'Select', options: YESNO},
      'is_cms_user': {type: 'Select', options: YESNO},
      'is_edit_link': {type: 'Select', options: YESNO},
      'is_map': {type: 'Select', options: YESNO},
      'is_proximity_search': {type: 'Select', options: YESNO},
      'is_reserved': {type: 'Select', options: YESNO},
      'is_uf_link': {type: 'Select', options: YESNO},
      'is_update_dupe': {type: 'Select', options: YESNO},
      'limit_listings_group_id': {type: 'Number'},
      'notify': {type: 'TextArea'},
      'post_URL': {type: 'Text'}
    },
    initialize: function() {
    }
  });
})();
