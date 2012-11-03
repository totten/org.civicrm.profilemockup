cj(document).ready(function($){
//Use BootstrapModal for object List editor
    Backbone.Form.editors.List.Modal.ModalAdapter = Backbone.BootstrapModal;

    //Main model definition
    var User = Backbone.Model.extend({
        schema: {
            title:      { type: 'Select', options: ['', 'Mr', 'Mrs', 'Ms'] },
            name:       'Text',
            email:      { validators: ['required', 'email'] },
            birthday:   'Date',
            password:   'Password',
            notes:      { type: 'List' },
            weapons:    { type: 'List', itemType: 'Object', subSchema: {
                name: { validators: ['required'] },
                number: 'Number'
            }}
        }
    });
    
    var user = new User({
        title: 'Mr',
        name: 'Sterling Archer',
        email: 'sterling@isis.com',
        birthday: new Date(1978, 6, 12),
        password: 'dangerzone',
        notes: [
            'Buy new turtleneck',
            'Call Woodhouse',
            'Buy booze'
        ],
        weapons: [
            { name: 'Uzi', number: 2 },
            { name: 'Shotgun', number: 1 }
        ]
    });
    
    //The form
    var form = new Backbone.Form({
        model: user
    }).render();
    
    //Add it to the page
    $('#profile_editor_app').append(form.el);
});