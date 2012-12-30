(function() {
  var CRM = (window.CRM) ? (window.CRM) : (window.CRM = {});
  if (!CRM.UF) CRM.UF = {};

  var YESNO = [
    {val: 0, label: ts('No')},
    {val: 1, label: ts('Yes')}
  ];

  var VISIBILITY = [
    {val: 'User and User Admin Only', label: ts('User and User Admin Only'), isSearchableAllowed: false},
    {val: 'Public Pages', label: ts('Public Pages'), isSearchableAllowed: true},
    {val: 'Public Pages and Listings', label: ts('Public Pages and Listings'), isSearchableAllowed: true}
  ];

  var LOCATION_TYPES = _.map(CRM.PseudoConstant.locationType, function(value, key) {
    return {val: key, label: value};
  });
  LOCATION_TYPES.unshift({val: '', label: ts('Primary')});

  var PHONE_TYPES = _.map(CRM.PseudoConstant.phoneType, function(value, key) {
    return {val: key, label: value};
  });

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
      'id': {
        type: 'Number'
      },
      'uf_group_id': {
        type: 'Number'
      },
      'entity_name': {
        // pseudo-field
        type: 'Text'
      },
      'field_name': {
        type: 'Text'
      },
      'field_type': {
        type: 'Select',
        options: ['Contact', 'Individual', 'Organization', 'Contribution', 'Membership', 'Participant', 'Activity']
      },
      'help_post': {
        title: ts('Field Post Help'),
        type: 'TextArea',
        help: ts("Explanatory text displayed to users for this field (can include HTML formatting tags).")
      },
      'help_pre': {
        title: ts('Field Pre Help'),
        type: 'TextArea',
        help: ts("Explanatory text displayed to users for this field (can include HTML formatting tags).")
      },
      'in_selector': {
        type: ts('Select'),
        options: YESNO,
        help: ts("Is this field included as a column in the search results table? This setting applies only to fields with 'Public Pages' or 'Public Pages and Listings' visibility.")
      },
      'is_active': {
        title: ts('Active?'),
        type: 'Select',
        options: YESNO
      },
      'is_multi_summary': {
        title: ts("Include in multi-record listing?"),
        type: 'Select',
        options: YESNO
      },
      'is_required': {
        title: ts('Required?'),
        type: 'Select',
        options: YESNO,
        help: ts("Are users required to complete this field?")
      },
      'is_reserved': {
        type: 'Select',
        options: YESNO
      },
      'is_searchable': {
        title: ts("Searchable"),
        type: 'Select',
        options: YESNO,
        help: ts("Do you want to include this field in the Profile's Search form?")
      },
      'is_view': {
        title: ts('View Only?'),
        type: 'Select',
        options: YESNO,
        help: ts('If checked, users can view but not edit this field.') + '<br/>'
          + ts('NOTE: View Only fields can not be included in Profile Search forms.')
      },
      'label': {
        title: ts('Field Label'),
        type: 'Text'
      },
      'location_type_id': {
        title: ts('Location Type'),
        type: 'Select',
        options: LOCATION_TYPES
      },
      'phone_type_id': {
        title: ts('Phone Type'),
        type: 'Select',
        options: PHONE_TYPES
      },
      'visibility': {
        title: ts('Visibility'),
        type: 'Select',
        options: VISIBILITY,
        help: ts("Is this field hidden from other users ('User and User Admin Only'), or is it visible to others and potentially searchable in the Profile Search form ('Public Pages' or 'Public Pages and Listings')? When visibility is 'Public Pages and Listings', users can also click the field value when viewing a contact in order to locate other contacts with the same value(s) (i.e. other contacts who live in Poland).")
      },
      'weight': {
        type: 'Number'
      }
    },
    initialize: function() {
      this.set('entity_name', CRM.UF.guessEntityName(this.get('field_type')));
    },
    isSearchableAllowed: function() {
      var visibility = _.first(_.where(VISIBILITY, {val: this.get('visibility')}));
      return visibility.isSearchableAllowed;
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
