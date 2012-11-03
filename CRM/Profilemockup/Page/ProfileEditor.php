<?php

require_once 'CRM/Core/Page.php';

class CRM_Profilemockup_Page_ProfileEditor extends CRM_Core_Page {
  function run() {
    // Example: Set the page-title dynamically; alternatively, declare a static title in xml/Menu/*.xml
    CRM_Utils_System::setTitle(ts('ProfileEditor'));

    // Example: Assign a variable for use in a template
    $this->assign('currentTime', date('Y-m-d H:i:s'));
    CRM_Core_Resources::singleton()
      ->addScript('$ = cj;')
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone/json2.js', 100)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone/underscore.js', 110)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone/backbone.js', 120)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/backbone-forms.js', 130)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/adapters/backbone.bootstrap-modal.min.js', 140)
      ->addScriptFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/editors/list.min.js', 140)
      ->addStyleFile('org.civicrm.profilemockup', 'packages/backbone-forms/distribution/templates/default.css', 140)
      ->addStyleFile('org.civicrm.profilemockup', 'css/profilemockup.css', 140)
      //->addScriptFile('org.civicrm.profilemockup', 'js/person-app.js', 200)
      //->addScriptFile('org.civicrm.profilemockup', 'js/form-app.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/civi-form-model.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/civi-form-view.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/civi-core-model.js', 200)
      ->addScriptFile('org.civicrm.profilemockup', 'js/profilemockup-app.js', 250)
      ;

    parent::run();
  }
}
