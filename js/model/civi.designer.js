(function(){
    var Civi = (window.Civi) ? (window.Civi) : (window.Civi={});
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
                //is_active: true,
                label: this.get('label'),
                field_type: this.get('modelClass').prototype.ENTITY_NAME,
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
        getFieldByName: function(entityName, fieldName) {
            return this.find(function(paletteFieldModel){
                return (paletteFieldModel.get('entityName') == entityName && paletteFieldModel.get('fieldName') == fieldName);
            });
        }
    });
})();
