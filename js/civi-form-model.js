(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Form) Civi.Form = {};

    /**
     * @param {class} ModelClass
     * @param {string} field_name
     */
    Civi.Form.createFormFieldModel = function(ModelClass, field_name) {
      var model = new Civi.Form.FieldModel({
        //is_active: true,
        label: field_name,
        field_type: ModelClass.prototype.ENTITY_NAME,
        field_name: field_name
      });
      return model;
    };

    /**
     * Represents a field in a customizable form.
     */
    Civi.Form.FieldModel = Backbone.Model.extend({
        schema: {
            'id': {type: 'Number'},
            'uf_group_id': {type: 'Number'},
            'label': {type: 'Text'},
            'field_type': {type: 'Select', options: ['Contact', 'Individual', 'Organization', 'Contribution', 'Membership', 'Participant', 'Activity']},
            'field_name': {type: 'Text'},
            'is_active': {type: 'Checkbox'},
            'is_view': {type: 'Checkbox'},
            'is_required': {type: 'Checkbox'},
            'weight': {type: 'Number'},
            'help_post': {type: 'Text'},
            'help_pre': {type: 'Text'},
            'visibility': {type: 'Select', options: ['User and User Admin Only','Public Pages','Public Pages and Listings']},
            'in_selector': {type: 'Checkbox'},
            'is_searchable': {type: 'Checkbox'},
            'location_type_id': {type: 'Number'},
            'phone_type_id': {type: 'Number'},
            'is_reserved': {type: 'Checkbox'},
            'is_multi_summary': {type: 'Checkbox'},
        },
        initialize: function(){
        },
    });

    /**
     * Represents a customizable form
     */
    Civi.Form.FormModel = Backbone.Model.extend({
        schema: {
            'id': {type: 'Number'},
            'title': {type: 'Text'},
            'is_active': {type: 'Checkbox'},
            'help_post': {type: 'Text'},
            'help_pre': {type: 'Text'}
            // TODO
        },
        initialize: function(){
        },
    });
})();
