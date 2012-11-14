<h3>This new page is generated by CRM/Profilemockup/Page/ProfileEditor.php</h3>

{* Markup for the initial page view *}

<div id="profile_editor_app"></div>

<button class="crm-designer-open">Edit Profile</button>
<div id="crm-designer-dialog" title="Dialog Title">
  <div id="crm-designer-designer" class="crm-clearfix">
  </div>
</div>

{* Library of templates *}

<script type="text/template" id="person_template">
  <form>
    <div>
      Hello, <%= name %>.<br/>
    </div>
    <div>New name:
      <input type="text" name="new_name">
      <input type="button" name="save" value="Save" />
    </div>
  </form>
</script>

<script type="text/template" id="designer_template">
  <div class="crm-designer">
    <div class="crm-designer-toolbar">
      <div class="crm-designer-buttonset">
        <button class="crm-designer-save">{ts}Save{/ts}</button>
        <button class="crm-designer-preview">{ts}Preview{/ts}</button>
      </div>
      <div class="crm-designer-palette">
      </div>
    </div>
    <div class="crm-designer-canvas">
      <div class="crm-designer-form">
        <div class="crm-designer-row">
          <span class="crm-designer-form-title"></span>
          <span class="crm-designer-buttons">
            <a class="crm-designer-action-settings ui-icon ui-icon-pencil" title="{ts}Settings{/ts}"></a>
          </span>
        </div>
        <div class="crm-designer-form-detail"></div>
      </div>
      <hr/>
      <div class="crm-designer-fields">
        <div class="crm-designer-row placeholder">{ts}Drag a field from the palette to add it to this form.{/ts}</div>
      </div>
    </div>
  </div>
</script>

{*
Render a palette of available fields

@param array<string,PaletteFieldModel> fieldsByEntitySection
@param array<string,sectionData> sections
*}
{literal}
<script type="text/template" id="palette_template">
  <div class="crm-designer-palette-acc">
    <% _.each(sections, function(section, sectionId){ %>
      <h3><%= section.title %></h3>
      <div>
        <div>
        <% _.each(fieldsByEntitySection[sectionId], function(paletteFieldModel){ %>
          <div class="crm-designer-palette-field" data-plm-cid="<%= paletteFieldModel.cid %>"><%= paletteFieldModel.get('label') %></div>
        <%}); %>
        </div>
        <% if (section.is_addable) { %>
          <button>Add</button>
        <% } %>
      </div>
    <% }); %>
  </div>
</script>
{/literal}

{*
@param Civi.Form.FieldModel formField
*}
{literal}
<script type="text/template" id="field_template">
  <div class="crm-designer-row" data-field-cid="<%= formField.cid %>" data-plm-cid="<%= paletteField.cid %>">
    <%= formField.get('label') %>
    <span class="crm-designer-field-binding">(<%= paletteField.getSection().title %>: <%= formField.get('field_name') %>)</span>
    <span class="crm-designer-buttons">
      <a class="ui-icon ui-icon-pencil crm-designer-action-settings" title="{ts}Settings{/ts}"></a>
      <a class="ui-icon ui-icon-trash crm-designer-action-remove" title="{ts}Remove{/ts}"></a>
    </span>
  </div>
</script>
{/literal}
