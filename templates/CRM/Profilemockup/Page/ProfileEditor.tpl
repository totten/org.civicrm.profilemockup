<h3>This new page is generated by CRM/Profilemockup/Page/ProfileEditor.php</h3>

{* Markup for the initial page view *}

<div id="profile_editor_app"></div>

<button class="crm-profilemockup-open">Edit Profile</button>
<div id="crm-profilemockup-dialog" title="Dialog Title">
  <div id="crm-profilemockup-designer" class="crm-clearfix">
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
    <div class="crm-profilemockup-toolbar">
      <div class="crm-profilemockup-buttonset">
        <button class="crm-profilemockup-save">{ts}Save{/ts}</button>
        <button class="crm-profilemockup-preview">{ts}Preview{/ts}</button>
      </div>
      <div class="crm-profilemockup-palette">
      </div>
    </div>
    <div class="crm-profilemockup-canvas">
      <div class="crm-profilemockup-form">
        <div class="crm-profilemockup-form-summary"><span class="crm-profilemockup-form-title"></span> <button class="crm-profilemockup-form-prop">{ts}Settings{/ts}</button></div>
        <div class="crm-profilemockup-form-detail"></div>
      </div>
      <div class="crm-profilemockup-fields">
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
  <div class="crm-profilemockup-palette-acc">
    <% _.each(sections, function(section, sectionId){ %>
      <h3><%= section.title %></h3>
      <div>
        <div>
        <% _.each(fieldsByEntitySection[sectionId], function(paletteFieldModel){ %>
          <div class="crm-profilemockup-palette-field" data-plm-cid="<%= paletteFieldModel.cid %>"><%= paletteFieldModel.get('label') %></div>
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
