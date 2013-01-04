<h3>This demonstrates profile editing with backbone.marionette.js, jQuery, and CRM.api</h3>

{* Markup for the initial page view *}

<div id="profile_editor_app"></div>
<label for="test-profile-id">Select Profile</label>
<select id="test-profile-id">
{crmAPI var='result' entity='UFGroup' action='get' sequential=1}
{foreach from=$result.values item=UFGroup}
  <option value="{$UFGroup.id}">{$UFGroup.title}</option>
{/foreach}
  <option value="">- Add New Profile -</option>
</select>
<button class="crm-designer-open">Edit Profile</button>
<div id="crm-designer-dialog">
  <div id="crm-designer" class="crm-container full-height">
  </div>
</div>

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
        <a href="#" rel="open_all">{ts}Open All{/ts}</a>&nbsp; |&nbsp;
        <a href="#" rel="close_all">{ts}Close All{/ts}</a>
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
  <%= label %>
  <span class="crm-designer-field-binding"><%= _view.getBindingLabel() %></span>
  <span class="crm-designer-buttons">
    <a class="ui-icon ui-icon-pencil crm-designer-action-settings" title="{ts}Settings{/ts}"></a>
    <a class="ui-icon ui-icon-trash crm-designer-action-remove" title="{ts}Remove{/ts}"></a>
  </span>
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
  <span><%= title %></span>
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
    <div class="crm-designer-row placeholder">{ts}Drag a field from the palette to add it to this form.{/ts}</div>
  </div>
</script>

{**
 * Template overrides for backbone forms
 *}
<script type="text/template" id="crm_form_template">
  <form class="crm-form-block"><%= fieldsets %></form>
</script>

<script type="text/template" id="crm_form_field_template">
  <div class="crm-cow field-<%= key %>">
    <label for="<%= id %>"><%= title %></label>
    <div class="bbf-editor"><%= editor %></div>
    <div class="bbf-help"><%= help %></div>
    <div class="bbf-error"><%= error %></div>
  </div>
</script>
