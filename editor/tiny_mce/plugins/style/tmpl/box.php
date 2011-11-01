<?php
/**
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined('_JEXEC') or die('RESTRICTED');
?>
<table border="0">
    <tr>
      <td><label for="box_width">{#style_dlg.box_width}</label></td>
      <td>
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td><input type="text" id="box_width" name="box_width" class="mceEditableSelect" onchange="StyleDialog.synch('box_width','positioning_width');" /></td>
            <td>&nbsp;</td>
            <td><select id="box_width_measurement" name="box_width_measurement"></select></td>
          </tr>
        </table>
      </td>
      <td>&nbsp;&nbsp;&nbsp;<label for="box_float">{#style_dlg.box_float}</label></td>
      <td><select id="box_float" name="box_float" class="mceEditableSelect"></select></td>
    </tr>
  
    <tr>
      <td><label for="box_height">{#style_dlg.box_height}</label></td>
      <td>
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td><input type="text" id="box_height" name="box_height" class="mceEditableSelect" onchange="StyleDialog.synch('box_height','positioning_height');" /></td>
            <td>&nbsp;</td>
            <td><select id="box_height_measurement" name="box_height_measurement"></select></td>
          </tr>
        </table>
      </td>
      <td>&nbsp;&nbsp;&nbsp;<label for="box_clear">{#style_dlg.box_clear}</label></td>
      <td><select id="box_clear" name="box_clear" class="mceEditableSelect"></select></td>
    </tr>
  </table>
  <div style="float: left; width: 49%">
    <fieldset>
      <legend>{#style_dlg.padding}</legend>
  
      <table border="0">
        <tr>
          <td>&nbsp;</td>
          <td><input type="checkbox" id="box_padding_same" name="box_padding_same" class="checkbox" checked="checked" onclick="StyleDialog.toggleSame(this,'box_padding');" /> <label for="box_padding_same">{#style_dlg.same}</label></td>
        </tr>
        <tr>
          <td><label for="box_padding_top">{#style_dlg.top}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_padding_top" name="box_padding_top" class="mceEditableSelect" /></td>
                <td>&nbsp;</td>
                <td><select id="box_padding_top_measurement" name="box_padding_top_measurement"></select></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td><label for="box_padding_right">{#style_dlg.right}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_padding_right" name="box_padding_right" class="mceEditableSelect" disabled="disabled" /></td>
                <td>&nbsp;</td>
                <td><select id="box_padding_right_measurement" name="box_padding_right_measurement" disabled="disabled"></select></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td><label for="box_padding_bottom">{#style_dlg.bottom}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_padding_bottom" name="box_padding_bottom" class="mceEditableSelect" disabled="disabled" /></td>
                <td>&nbsp;</td>
                <td><select id="box_padding_bottom_measurement" name="box_padding_bottom_measurement" disabled="disabled"></select></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td><label for="box_padding_left">{#style_dlg.left}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_padding_left" name="box_padding_left" class="mceEditableSelect" disabled="disabled" /></td>
                <td>&nbsp;</td>
                <td><select id="box_padding_left_measurement" name="box_padding_left_measurement" disabled="disabled"></select></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </fieldset>
   </div>
   <div style="float: right; width: 49%">
    <fieldset>
      <legend>{#style_dlg.margin}</legend>
  
      <table border="0">
        <tr>
          <td>&nbsp;</td>
          <td><input type="checkbox" id="box_margin_same" name="box_margin_same" class="checkbox" checked="checked" onclick="StyleDialog.toggleSame(this,'box_margin');" /> <label for="box_margin_same">{#style_dlg.same}</label></td>
        </tr>
        <tr>
          <td><label for="box_margin_top">{#style_dlg.top}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_margin_top" name="box_margin_top" class="mceEditableSelect" /></td>
                <td>&nbsp;</td>
                <td><select id="box_margin_top_measurement" name="box_margin_top_measurement"></select></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td><label for="box_margin_right">{#style_dlg.right}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_margin_right" name="box_margin_right" class="mceEditableSelect" disabled="disabled" /></td>
                <td>&nbsp;</td>
                <td><select id="box_margin_right_measurement" name="box_margin_right_measurement" disabled="disabled"></select></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td><label for="box_margin_bottom">{#style_dlg.bottom}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_margin_bottom" name="box_margin_bottom" class="mceEditableSelect" disabled="disabled" /></td>
                <td>&nbsp;</td>
                <td><select id="box_margin_bottom_measurement" name="box_margin_bottom_measurement" disabled="disabled"></select></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td><label for="box_margin_left">{#style_dlg.left}</label></td>
          <td>
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td><input type="text" id="box_margin_left" name="box_margin_left" class="mceEditableSelect" disabled="disabled" /></td>
                <td>&nbsp;</td>
                <td><select id="box_margin_left_measurement" name="box_margin_left_measurement" disabled="disabled"></select></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </fieldset>
  </div>