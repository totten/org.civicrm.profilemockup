(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Form) Civi.Form = {};

    /**
     * This function is a hack for generating simulated values of "entity_name"
     * in the form-field model.
     *
     * @param {string} field_type
     * @return {string}
     */
    Civi.Form.guessEntityName = function(field_type) {
        switch (field_type) {
            case 'Contact':
            case 'Individual':
            case 'Organization':
                return 'contact_1';
            case 'Activity':
                return 'activity_1';
            default:
                throw "Cannot guess entity name for field_type="+field_type;
        }
    }

    /**
     * Represents a field in a customizable form.
     */
    Civi.Form.FieldModel = Backbone.Model.extend({
        schema: {
            'id': {type: 'Number'},
            'uf_group_id': {type: 'Number'},
            'label': {type: 'Text'},
            'entity_name': {type: 'Text'}, // pseudo-field
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
            this.set('entity_type', Civi.Form.guessEntityName(this.get('field_type')));
        },
    });

    /**
     * Represents a list of fields in a customizable form
     */
    Civi.Form.FieldCollection = Backbone.Collection.extend({
        model: Civi.Form.FieldModel,
        initialize: function() {
        }
    });

    /**
     * Represents a customizable form
     *
     * options:
     *  - fieldCollection: Civi.Form.FieldCollection
     */
    Civi.Form.FormModel = Backbone.Model.extend({
        schema: {
            'id': {type: 'Number'},
            'title': {type: 'Text'},
            'is_active': {type: 'Checkbox'},
            'help_pre': {type: 'Text'},
            'help_post': {type: 'Text'}
            // TODO
        },
        initialize: function(){
        },
    });
})();
