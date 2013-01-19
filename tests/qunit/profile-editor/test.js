module('UFGroupModel.checkGroupType');

var cases = [
  {group_type: '', validTypes: ['Individual', 'Contact', 'Activity'], expected: true},
  {group_type: 'Individual,Event', validTypes: ['Individual', 'Contact', 'Activity'], expected: false},
  {group_type: 'Individual,Event', validTypes: ['Individual'], expected: false},
  {group_type: 'Individual,Event', validTypes: ['Event', 'Individual'], expected: true},
  {group_type: 'Individual', validTypes: ['Individual', 'Contact', 'Activity'], expected: true},
  {group_type: 'Activity,Contact', validTypes: ['Individual', 'Contact', 'Activity'], expected: true}
];

_.each(cases, function(caseDetails, caseIndex) {
  test("#"+caseIndex+": With group_type="+caseDetails.group_type, function() {
    var ufGroupModel = new CRM.UF.UFGroupModel({
      group_type: caseDetails.group_type
    });
    equal(ufGroupModel.checkGroupType(caseDetails.validTypes), caseDetails.expected);
  });
});
