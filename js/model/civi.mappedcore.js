/**
 * Dynamically-generated alternative to civi.core.js
 */
(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
    if (!Civi.Core) Civi.Core = {};

    /**
     * Data models used by the Civi form designer require more attributes than basic Backbone models:
     *  - sections: array of field-groupings
     *  - schema: array of fields, keyed by field name, per backbone-forms; extra attributes:
     *     + section: string, index to the 'sections' array
     *     + civiFieldType: string
     *
     * @see https://github.com/powmedia/backbone-forms
     */

    Civi.Core.BaseModel = Backbone.Model.extend({
        initialize: function(){
        }
    });
    _.each(CRM.civiCoreModels, function(value, key, list){
      Civi.Core[key] = Civi.Core.BaseModel.extend(value);
    });
})();