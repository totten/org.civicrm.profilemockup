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
  <div id="crm-designer-designer" class="crm-clearfix">
  </div>
</div>

{* Library of templates *}

{**
 * Outer Region
 *}
<script type="text/template" id="designer_template">
  <div class="crm-designer">
    <div class="crm-designer-toolbar">
      <div class="crm-designer-buttonset-region">
      </div>
      <div class="crm-designer-palette-region">
      </div>
    </div>
    <div class="crm-designer-canvas">
      <div class="crm-designer-form-region">
      </div>
      <hr />
      <div class="crm-designer-fields-region">
      </div>
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
        <a href="#" rel="open_all">{ts}Open All{/ts}</a>&nbsp; | &nbsp;
        <a href="#" rel="close_all">{ts}Close All{/ts}</a>
      </div>
    </div>

    <div class="crm-designer-palette-tree">
    </div>
  </div>
</script>

{**
 * Template for CRM.UF.UFFieldModel, CRM.Designer.UFFieldView
 * @see extendedSerializeData()
 *}
{literal}
<script type="text/template" id="field_row_template">
  <div class="crm-designer-row" data-field-cid="<%= _model.cid %>">
    <div class="crm-designer-field-summary"></div>
    <div class="crm-designer-field-detail"></div>
  </div>
</script>
{/literal}

{**
 * Template for CRM.UF.UFFieldModel, CRM.Designer.UFFieldSummaryView
 * @see extendedSerializeData()
 *}
{literal}
<script type="text/template" id="field_summary_template">
  <%= label %>
  <span class="crm-designer-field-binding">(<%= _options.paletteFieldModel.getSection().title %>: <%= field_name %>)</span>
  <span class="crm-designer-buttons">
    <a class="ui-icon ui-icon-pencil crm-designer-action-settings" title="{/literal}{ts}Settings{/ts}{literal}"></a>
    <a class="ui-icon ui-icon-trash crm-designer-action-remove" title="{/literal}{ts}Remove{/ts}{literal}"></a>
  </span>
</script>
{/literal}

{**
 * @param CRM.UF.UFGroupModel form
 *}
{literal}
<script type="text/template" id="form_row_template">
  <div class="crm-designer-row">
    <div class="crm-designer-form-summary"></div>
    <div class="crm-designer-form-detail"></div>
  </div>
</script>
{/literal}

{**
 * Variables correspond to properties of CRM.UF.UFGroupModel
 *}
{literal}
<script type="text/template" id="form_summary_template">
  <span><%= title %></span>
  <div class="crm-designer-buttons">
    <a class="crm-designer-action-settings ui-icon ui-icon-pencil" title="{ts}Settings{/ts}"></a>
  </div>
</script>
{/literal}

<script type="text/template" id="designer_buttons_template">
  <button class="crm-designer-save">{ts}Save{/ts}</button>
  <button class="crm-designer-preview">{ts}Preview{/ts}</button>
</script>

<script type="text/template" id="field_canvas_view_template">
  <div class="crm-designer-fields">
    <div class="crm-designer-row placeholder">{ts}Drag a field from the palette to add it to this form.{/ts}</div>
  </div>
</script>
