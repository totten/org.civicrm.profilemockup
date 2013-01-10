<?php

require_once 'CRM/Core/Page.php';

class CRM_Profilemockup_Page_ProfileEditor extends CRM_Core_Page {
  function run() {

    CRM_Core_Resources::singleton()
      ->addSetting(array(
        'civiSchema' => self::getSchema(),
        'PseudoConstant' => array(
          'locationType' => CRM_Core_PseudoConstant::locationType(),
          'phoneType' => CRM_Core_PseudoConstant::phoneType(),
        ),
        'profilePreviewKey' => CRM_Core_Key::get('CRM_Core_Controller_Simple', TRUE),
      ))
      // TODO think of a way extensions can include jQuery plugins
      ->addScript('jQuery = $ = cj;') // HACK - must be removed
      ->addScriptFile('civicrm', 'packages/backbone/json2.js', 100)
      ->addScriptFile('civicrm', 'packages/backbone/underscore.js', 110)
      ->addScriptFile('civicrm', 'packages/backbone/backbone.js', 120)
      ->addScriptFile('civicrm', 'packages/backbone/backbone.marionette.js', 125)
      ->addScriptFile('civicrm', 'packages/backbone-forms/distribution/backbone-forms.js', 130)
      ->addScriptFile('civicrm', 'packages/backbone-forms/distribution/adapters/backbone.bootstrap-modal.min.js', 140)
      ->addScriptFile('civicrm', 'packages/backbone-forms/distribution/editors/list.min.js', 140)
      ->addStyleFile('civicrm', 'packages/backbone-forms/distribution/templates/default.css', 140)
      ->addStyleFile('org.civicrm.profilemockup', 'css/profilemockup.css', 140)
      ->addScriptFile('org.civicrm.profilemockup', 'js/crm.backbone.js', 150)
      //->addScriptFile('org.civicrm.profilemockup', 'js/person-app.js', 200)
      //->addScriptFile('org.civicrm.profilemockup', 'js/form-app.js', 200)
      //->addScriptFile('org.civicrm.profilemockup', 'js/model/crm.schema.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/model/crm.schema-mapped.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/model/crm.uf.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/model/crm.designer.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/view/crm.designer.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/profilemockup-app.js', 250)
      ;

    parent::run();
  }

  /**
   * AJAX callback
   */
  static function getSchemaJSON() {
    echo json_encode(self::getSchema());
    CRM_Utils_System::civiExit();
  }

  /**
   * Get a list of Backbone-Form models
   *
   * @return array; keys are model names ("IndividualModel") and values describe 'sections' and 'schema'
   * @see js/model/crm.core.js
   * @see js/model/crm.mappedcore.js
   */
  static function getSchema() {
    // FIXME: Depending on context (eg civicrm/profile/create vs search-columns), it may be appropriate to
    // pick importable or exportable fields
    $availableFields = CRM_Core_BAO_UFField::getAvailableFieldsFlat();

    $extends = array('Individual', 'Contact');
    $civiSchema['IndividualModel'] = self::convertCiviModelToBackboneModel(
      ts('Individual'),
      CRM_Contact_BAO_Contact::importableFields('Individual', FALSE, FALSE, TRUE, TRUE, TRUE),
      CRM_Core_BAO_CustomGroup::getGroupDetail(NULL, NULL, $extends),
      $availableFields
    );

    $extends = array('Activity');
    $civiSchema['ActivityModel'] = self::convertCiviModelToBackboneModel(
      ts('Activity'),
      CRM_Activity_BAO_Activity::importableFields('Activity'),
      CRM_Core_BAO_CustomGroup::getGroupDetail(NULL, NULL, $extends),
      $availableFields
    );

    return $civiSchema;
  }

  /**
   * FIXME: Move to somewhere more useful
   * FIXME: Do real mapping of "types"
   * FIXME: Correctly differentiate "field_type" for "Contact" vs "Individual"
   *
   * @param string $title a string to use in section headers
   * @param array $fields list of all core and custom fields which should be displayed
   * @param array $customGroups list of custom groups produced by getGroupDetail()
   * @param array $availableFields list of fields that are allowed in profiles, e.g. $availableFields['my_field']['field_type']
   * @return array with keys 'sections' and 'schema'
   * @see js/model/crm.core.js
   * @see js/model/crm.mappedcore.js
   */
  static function convertCiviModelToBackboneModel($title, $fields, $customGroupTree, $availableFields) {
    $locationFields = CRM_Core_BAO_UFGroup::getLocationFields();

    $result = array(
      'schema' => array(),
      'sections' => array(),
    );

    // build field list
    foreach ($fields as $fieldName => $field) {
      if (!isset($field['type']) && !isset($field['html_type'])) {
        continue;
      }
      if (!isset($availableFields[$fieldName])) {
        continue;
      }
      $result['schema'][$fieldName] = array(
        'type' => 'Text', // FIXME,
        'title' => $field['title'],
        'civiFieldType' => $availableFields[$fieldName]['field_type'],
      );
      if (in_array($fieldName, $locationFields)) {
        $result['schema'][$fieldName]['civiIsLocation'] = TRUE;
      }
      if (in_array($fieldName, array('phone'))) { // FIXME what about phone_ext?
        $result['schema'][$fieldName]['civiIsPhone'] = TRUE;
      }
    }

    // build section list
    $result['sections']['default'] = array(
      'title' => $title,
      'is_addable' => FALSE,
    );

    foreach ($customGroupTree as $customGroup) {
      $sectionName = 'cg_' . $customGroup['id'];
      $section = array(
        'title' => ts('%1: %2', array(1 => $title, 2 => $customGroup['title'])),
        'is_addable' => TRUE,
        'custom_group_id' => $customGroup['id'],
      );
      $result['sections'][$sectionName] = $section;
    }

    // put fields in their sections
    foreach ($customGroupTree as $customGroup) {
      $sectionName = 'cg_' . $customGroup['id'];
      foreach ($customGroup['fields'] as $field) {
        $fieldName = 'custom_' . $field['id'];
        if (isset($result['schema'][$fieldName])) {
          $result['schema'][$fieldName]['section'] = $sectionName;
        }
        $result['schema'][$fieldName]['civiIsMultiple'] = (bool)CRM_Core_BAO_CustomField::isMultiRecordField($field['id']);
      }
    }
    return $result;
  }
}
