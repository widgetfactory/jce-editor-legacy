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
<table border="0" width="100%">
      <tr>
        <td><label for="text_font">{#style_dlg.text_font}</label></td>
        <td colspan="3">
          <select id="text_font" name="text_font" class="mceEditableSelect mceFocus"></select>
        </td>
      </tr>
      <tr>
        <td><label for="text_size">{#style_dlg.text_size}</label></td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><select id="text_size" name="text_size" class="mceEditableSelect"></select></td>
              <td>&nbsp;</td>
              <td><select id="text_size_measurement" name="text_size_measurement"></select></td>
            </tr>
          </table>
        </td>
        <td><label for="text_weight">{#style_dlg.text_weight}</label></td>
        <td>
          <select id="text_weight" name="text_weight"></select>
        </td>
      </tr>
      <tr>
        <td><label for="text_style">{#style_dlg.text_style}</label></td>
        <td>
          <select id="text_style" name="text_style" class="mceEditableSelect"></select>
        </td>
        <td><label for="text_variant">{#style_dlg.text_variant}</label></td>
        <td>
          <select id="text_variant" name="text_variant"></select>
        </td>
      </tr>
      <tr>
        <td><label for="text_lineheight">{#style_dlg.text_lineheight}</label></td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <select id="text_lineheight" name="text_lineheight" class="mceEditableSelect"></select>
              </td>
              <td>&nbsp;</td>
              <td><select id="text_lineheight_measurement" name="text_lineheight_measurement"></select></td>
            </tr>
          </table>
        </td>
        <td><label for="text_case">{#style_dlg.text_case}</label></td>
        <td>
          <select id="text_case" name="text_case"></select>
        </td>
      </tr>
      <tr>
        <td><label for="text_color">{#style_dlg.text_color}</label></td>
        <td colspan="2">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td><input id="text_color" name="text_color" class="color" type="text" value="" size="9" /></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td valign="top" style="vertical-align: top; padding-top: 3px;">{#style_dlg.text_decoration}</td>
        <td colspan="2">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><input id="text_underline" name="text_underline" class="checkbox" type="checkbox" /></td>
              <td><label for="text_underline">{#style_dlg.text_underline}</label></td>
            </tr>
            <tr>
              <td><input id="text_overline" name="text_overline" class="checkbox" type="checkbox" /></td>
              <td><label for="text_overline">{#style_dlg.text_overline}</label></td>
            </tr>
            <tr>
              <td><input id="text_linethrough" name="text_linethrough" class="checkbox" type="checkbox" /></td>
              <td><label for="text_linethrough">{#style_dlg.text_striketrough}</label></td>
            </tr>
            <tr>
              <td><input id="text_blink" name="text_blink" class="checkbox" type="checkbox" /></td>
              <td><label for="text_blink">{#style_dlg.text_blink}</label></td>
            </tr>
            <tr>
              <td><input id="text_none" name="text_none" class="checkbox" type="checkbox" onclick="StyleDialog.updateTextDecorations();" /></td>
              <td><label for="text_none">{#style_dlg.text_none}</label></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>