<?php

require_once 'CRM/Core/Page.php';

class CRM_Profilemockup_Page_Preview extends CRM_Core_Page {
  function run() {
    // FIXME reconcile with CRM_UF_Form_Preview and CRM_UF_BAO_UFGroup::getFields
    // FIXME think about XSS
    $content = json_decode(file_get_contents("php://input"), TRUE);
    echo '<pre>'.htmlentities(print_r($content, TRUE)) .'</pre>';
    CRM_Utils_System::civiExit();
  }
}
