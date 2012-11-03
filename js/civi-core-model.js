(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Core) Civi.Core = {};

    /**
     * Civi data models require more attributes than basic Backbone models:
     *  - ENTITY_NAME: constant used in Civi's data model
     *  - sections: array of field-groupings
     *  - schema: array of fields, keyed by field name, per backbone-forms
     *
     * @see https://github.com/powmedia/backbone-forms
     */

    Civi.Core.IndividualModel = Backbone.Model.extend({
        ENTITY_NAME: 'Individual',
        sections: {
            'default': {title: 'Individual: Core'},
            'custom1': {title: 'Individual: Favorite Things', is_addable: true},
            'custom2': {title: 'Individual: Custom Things', is_addable: true}
        },
        schema: {
            first_name: { type: 'Text' },
            last_name: { type: 'Text' },
            email: { validators: ['required', 'email'] },
            custom_123: { type: 'Checkbox', section: 'custom1', title: 'Likes whiskers on kittens'},
            custom_456: { type: 'Checkbox', section: 'custom1', title: 'Likes dog bites' },
            custom_789: { type: 'Checkbox', section: 'custom1', title: 'Likes bee stings' },
        },
        initialize: function(){
        },
    });

    Civi.Core.ActivityModel = Backbone.Model.extend({
        ENTITY_NAME: 'Activity',
        sections: {
            'default': {title: 'Activity: Core'},
            'custom3': {title: 'Activity: Questions', is_addable: true}
        },
        schema: {
            subject: { type: 'Text' },
            location: { type: 'Text' },
            activity_date_time: { type: 'DateTime' },
            custom_789: { type: 'Select', section: 'custom3', title: 'How often do you eat cheese?',
              options: ['Never', 'Sometimes', 'Often'],
            },
        },
        initialize: function(){
        },
    });
})();