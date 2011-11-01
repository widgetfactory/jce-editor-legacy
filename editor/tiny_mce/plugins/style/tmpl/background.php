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
        <td><label for="background_color">{#style_dlg.background_color}</label></td>
        <td>
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td><input id="background_color" name="background_color" class="color" type="text" value="" size="9" /></td>
            </tr>
          </table>
        </td>
      </tr>
  
      <tr>
        <td><label for="background_image">{#style_dlg.background_image}</label></td>
        <td><table border="0" cellspacing="0" cellpadding="0">
          <tr> 
            <td><input id="background_image" name="background_image" class="browser image" type="text" /></td> 
          </tr>
          </table>
        </td>
      </tr>
  
      <tr>
        <td><label for="background_repeat">{#style_dlg.background_repeat}</label></td>
        <td><select id="background_repeat" name="background_repeat" class="mceEditableSelect"></select></td>
      </tr>
  
      <tr>
        <td><label for="background_attachment">{#style_dlg.background_attachment}</label></td>
        <td><select id="background_attachment" name="background_attachment" class="mceEditableSelect"></select></td>
      </tr>
  
      <tr>
        <td><label for="background_hpos">{#style_dlg.background_hpos}</label></td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><select id="background_hpos" name="background_hpos" class="mceEditableSelect"></select></td>
              <td>&nbsp;</td>
              <td><select id="background_hpos_measurement" name="background_hpos_measurement"></select></td>
            </tr>
          </table>
        </td>
      </tr>
  
      <tr>
        <td><label for="background_vpos">{#style_dlg.background_vpos}</label></td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><select id="background_vpos" name="background_vpos" class="mceEditableSelect"></select></td>
              <td>&nbsp;</td>
              <td><select id="background_vpos_measurement" name="background_vpos_measurement"></select></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>