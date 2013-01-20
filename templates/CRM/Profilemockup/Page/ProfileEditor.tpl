<h3>This demonstrates profile editing with backbone.marionette.js, jQuery, and CRM.api</h3>

{* Markup for the initial page view *}

<div id="profile_editor_app"></div>

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
<input id="act-profile-id" type="text" class="crm-profile-selector" value="4"
    data-group-type="Individual,Contact,Activity;;ActivityType:28"
    data-entities="contact_1:IndividualModel,activity_1:ActivityModel" />

{* Library of templates *}

{**
 * Outer Region
 *}
<script type="text/template" id="designer_template">
  <div class="crm-designer-toolbar full-height">
    <div class="crm-designer-buttonset-region">
    </div>
    <hr />
    <div class="crm-designer-palette-region full-height">
    </div>
  </div>
  <div class="crm-designer-canvas full-height scroll">
    <div class="crm-designer-preview-canvas"></div>
    <div class="crm-designer-form-region">
    </div>
    <hr />
    <div class="crm-designer-fields-region">
    </div>
  </div>
</script>

{**
 * Render the field-palette container
 *}
<script type="text/template" id="palette_template">
  <div class="crm-designer-palette">
    <div class="crm-designer-palette-search">
      <input type="text" placeholder="{ts}Search{/ts}" />
      <a class="crm-designer-palette-clear-search" href="#" title="{ts}Clear search{/ts}">X</a>
      <div class="crm-designer-palette-controls">
        <a href="#" class="crm-designer-palette-toggle" rel="open_all">{ts}Open All{/ts}</a>&nbsp; |&nbsp;
        <a href="#" class="crm-designer-palette-toggle" rel="close_all">{ts}Close All{/ts}</a>&nbsp; |&nbsp;
        <a href="#" class="crm-designer-palette-refresh">{ts}Refresh{/ts}</a>
      </div>
    </div>

    <div class="crm-designer-palette-tree scroll">
    </div>
  </div>
</script>

{**
 * Template for CRM.UF.UFFieldModel, CRM.Designer.UFFieldView
 * @see extendedSerializeData()
 *}
<script type="text/template" id="field_row_template">
  <div class="crm-designer-row" data-field-cid="<%= _model.cid %>">
    <div class="crm-designer-field-summary"></div>
    <div class="crm-designer-field-detail"></div>
  </div>
</script>

{**
 * Template for CRM.UF.UFFieldModel, CRM.Designer.UFFieldSummaryView
 * @see extendedSerializeData()
 *}
<script type="text/template" id="field_summary_template">
  <span class="crm-designer-buttons">
    <a class="ui-icon ui-icon-pencil crm-designer-action-settings" title="{ts}Settings{/ts}"></a>
    <a class="ui-icon ui-icon-trash crm-designer-action-remove" title="{ts}Remove{/ts}"></a>
  </span>
  <div class="description"><%= help_pre %></div>
  <div class="crm-designer-row-label">
    <span class="crm-designer-label"><%= label %></span>
    <%= _view.getRequiredMarker() %>
    <span class="crm-designer-field-binding"><%= _view.getBindingLabel() %></span>
  </div>
  <div class="description"><%= help_post %></div>
</script>

{**
 * @param CRM.UF.UFGroupModel form
 *}
<script type="text/template" id="form_row_template">
  <div class="crm-designer-row">
    <div class="crm-designer-form-summary"></div>
    <div class="crm-designer-form-detail"></div>
  </div>
</script>

{**
 * Variables correspond to properties of CRM.UF.UFGroupModel
 *}
<script type="text/template" id="form_summary_template">
  <h3><%= title %></h3>
  <div class="crm-designer-buttons">
    <a class="crm-designer-action-settings ui-icon ui-icon-pencil" title="{ts}Settings{/ts}"></a>
  </div>
</script>

<script type="text/template" id="designer_buttons_template">
  <button class="crm-designer-save">{ts}Save{/ts}</button>
  <button class="crm-designer-preview">{ts}Preview{/ts}</button>
</script>

<script type="text/template" id="field_canvas_view_template">
  <div class="crm-designer-fields">
    <div class="crm-designer-row placeholder">{ts}To add a field to this form, drag or double-click an item in the palette.{/ts}</div>
  </div>
</script>

{**
 * Variables correspond to properties of CRM.ProfileSelector.DummyModel
 *}
<script type="text/template" id="profile_selector_template">
    <div>
        <span class="crm-profile-selector-select"></span>
        <button class="crm-profile-selector-edit">Edit</button>
        <button class="crm-profile-selector-copy">Copy</button>
        <button class="crm-profile-selector-create">Create</button>
    </div>
    <div class="crm-profile-selector-preview-pane">
        {ts}(Preview Area){/ts}
    </div>
</script>

<script type="text/template" id="profile_selector_option_template">
<%= title %>
</script>

<script type="text/template" id="profile_selector_option_template">
<%= title %>
</script>

{**
 * Variables correspond to properties of CRM.ProfileSelector.DummyModel
 *}
<script type="text/template" id="designer_dialog_template">
  <div class="crm-designer crm-container full-height">
  </div>
</script>
