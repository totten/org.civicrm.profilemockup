<?php

require_once 'CRM/Core/Page.php';

class CRM_Profilemockup_Page_ProfileEditor extends CRM_Core_Page {
  function run() {
    // Example: Set the page-title dynamically; alternatively, declare a static title in xml/Menu/*.xml
    CRM_Utils_System::setTitle(ts('ProfileEditor'));

    // Example: Assign a variable for use in a template
    $this->assign('currentTime', date('Y-m-d H:i:s'));
    CRM_Core_Resources::singleton()
      ->addSetting(array('civiCoreModels' => $this->getModels()))
      // TODO think of a way extensions can include jQuery plugins
      ->addScript('jQuery = $ = cj;') // HACK - must be removed
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone/json2.js', 100)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone/underscore.js', 110)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone/backbone.js', 120)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone/backbone.marionette.js', 125)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/backbone-forms.js', 130)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/adapters/backbone.bootstrap-modal.min.js', 140)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/editors/list.min.js', 140)
      ->addStyleFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/templates/default.css', 140)
      ->addStyleFile('org.civicrm.profilemockup', 'css/profilemockup.css', 140)
      //->addScriptFile('org.civicrm.profilemockup', 'js/person-app.js', 200)
      //->addScriptFile('org.civicrm.profilemockup', 'js/form-app.js', 200)
      //->addScriptFile('org.civicrm.profilemockup', 'js/model/civi.core.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/model/civi.mappedcore.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/model/civi.uf.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/model/civi.designer.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/view/civi.designer.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/profilemockup-app.js', 250)
      ;

    parent::run();
  }

  /**
   * Get a list of Backbone-Form models
   *
   * @return array; keys are model names ("IndividualModel") and values describe 'sections' and 'schema'
   * @see js/model/civi.core.js
   * @see js/model/civi.mappedcore.js
   */
  function getModels() {
    // FIXME: Depending on context (eg civicrm/profile/create vs search-columns), it may be appropriate to
    // pick importable or exportable fields

    $extends = array('Individual', 'Contact');
    $civiCoreModels['IndividualModel'] = $this->convertCiviModelToBackboneModel(
      'Individual',
      ts('Individual'),
      CRM_Contact_BAO_Contact::importableFields('Individual', FALSE, FALSE, TRUE, TRUE, TRUE),
      CRM_Core_BAO_CustomGroup::getGroupDetail(NULL, NULL, $extends)
    );

    $extends = array('Activity');
    $civiCoreModels['ActivityModel'] = $this->convertCiviModelToBackboneModel(
      'Activity',
      ts('Activity'),
      CRM_Activity_BAO_Activity::importableFields('Activity'),
      CRM_Core_BAO_CustomGroup::getGroupDetail(NULL, NULL, $extends)
    );

    return $civiCoreModels;
  }

  /**
   * FIXME: Move to somewhere more useful
   * FIXME: Do real mapping of "types"
   * FIXME: Correctly differentiate "field_type" for "Contact" vs "Individual"
   *
   * @param string $title a string to use in section headers
   * @param array $fields list of all core and custom fields which should be displayed
   * @param array $customGroups list of custom groups produced by getGroupDetail()
   * @return array with keys 'sections' and 'schema'
   * @see js/model/civi.core.js
   * @see js/model/civi.mappedcore.js
   */
  function convertCiviModelToBackboneModel($fixmeCiviFieldType, $title, $fields, $customGroupTree) {
    $result = array(
      'schema' => array(),
      'sections' => array(),
    );

    // build field list
    foreach ($fields as $fieldName => $field) {
      if (!isset($field['type']) && !isset($field['html_type'])) {
        continue;
      }
      $result['schema'][$fieldName] = array(
        'type' => 'Text', // FIXME,
        'title' => $field['title'],
        'civiFieldType' => $fixmeCiviFieldType, // FIXME
      );
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
      }
    }
    return $result;
  }
}
