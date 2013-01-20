<h3>This demonstrates profile editing with backbone.marionette.js, jQuery, and CRM.api</h3>

{* Markup for the initial page view *}

{* Note: This example shows two fields using different filters and entity bindings.
   This is not necessarily safe -- there are ways the second widget could modify data
   to break the first widget. It's safest if the widgets either use the exact
   same group-types/entities or strictly disjoint group-types/entities.
 *}

<label for="contact-profile-id">Contact Profile</label>
<input id="contact-profile-id" type="text" class="crm-profile-selector" value="4"
       data-group-type="Individual,Contact"
       data-entities="contact_1:IndividualModel" />

<label for="act-profile-id">Activity Profile</label>
<input id="act-profile-id" type="text" class="crm-profile-selector" value=""
    data-group-type="Individual,Contact,Activity;;ActivityType:28"
    data-entities="contact_1:IndividualModel,activity_1:ActivityModel" />

