(function() {
  var Civi = (window.Civi) ? (window.Civi) : (window.Civi = {});
  if (!Civi.Designer) Civi.Designer = {};

  Civi.Designer.PaletteFieldModel = Backbone.Model.extend({
    defaults: {
      /**
       * @var {class} required; eg Civi.Core.ActivityModel
       */
      modelClass: null,

      /**
       * @var {string} required; a form-specific binding to an entity instance (eg 'student', 'mother')
       */
      entityName: null,

      /**
       * @var {string}
       */
      sectionName: null,

      /**
       * @var {string}
       */
      fieldName: null,

      /**
       * @var {object} like Backbone.Form
       */
      fieldSchema: null,

      /**
       * @var {string}
       */
      label: null
    },
    initialize: function() {
      var fieldSchema = this.get('modelClass').prototype.schema[this.get('fieldName')];
      this.set('fieldSchema', fieldSchema);
      this.set('sectionName', fieldSchema.section || 'default');
      this.set('label', fieldSchema.title || this.get('fieldName'));
    },
    getSection: function() {
      return this.get('modelClass').prototype.sections[this.get('sectionName')];
    },
    createFormFieldModel: function() {
      var model = new Civi.Form.FieldModel({
        is_active: 1,
        label: this.get('label'),
        entity_name: this.get('entityName'),
        field_type: this.get('fieldSchema').civiFieldType,
        field_name: this.get('fieldName')
      });
      return model;
    }
  });

  Civi.Designer.PaletteFieldCollection = Backbone.Collection.extend({
    model: Civi.Designer.PaletteFieldModel,
    initialize: function() {
    },
    addEntity: function(entityName, modelClass, options) {
      var collection = this;
      _.each(modelClass.prototype.schema, function(value, key, list) {
        var model = new Civi.Designer.PaletteFieldModel({
          modelClass: modelClass,
          entityName: entityName,
          fieldName: key
        });
        collection.add(model, options);
      });
    },

    /**
     * Look up a palette-field
     *
     * @param entityName
     * @param fieldName
     * @return {Civi.Designer.PaletteFieldModel}
     */
    getFieldByName: function(entityName, fieldName) {
      return this.find(function(paletteFieldModel) {
        return (paletteFieldModel.get('entityName') == entityName && paletteFieldModel.get('fieldName') == fieldName);
      });
    },

    /**
     * Get a list of all fields, grouped into sections by "entityName+sectionName".
     *
     * @return {Object} keys are sections ("entityName+sectionName"); values are Civi.Designer.PaletteFieldModel
     */
    getFieldsByEntitySection: function() {
      // TODO cache
      var fieldsByEntitySection = this.groupBy(function(paletteFieldModel) {
        return paletteFieldModel.get('entityName') + '-' + paletteFieldModel.get('sectionName');
      });
      return fieldsByEntitySection;
    },

    /**
     * Get a list of all sections mentioned in this field-collection
     *
     * @return {Object} keys are synthetic section is; values are objects with "title", "is_addable", etc
     */
    getSections: function() {
      // TODO cache
      var sections = {};
      _.each(this.getFieldsByEntitySection(), function(localPaletteFields, sectionId, label) {
        sections[sectionId] = _.first(localPaletteFields).getSection();
      });
      return sections;
    }
  });
})();
