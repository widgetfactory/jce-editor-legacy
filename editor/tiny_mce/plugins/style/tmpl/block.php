<?php
/**
* @version    $Id: block.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author   Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined('_JEXEC') or die('ERROR_403');
?>
<table border="0">
      <tr>
        <td><label for="block_wordspacing">{#style_dlg.block_wordspacing}</label></td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><select id="block_wordspacing" name="block_wordspacing" class="mceEditableSelect"></select></td>
              <td>&nbsp;</td>
              <td><select id="block_wordspacing_measurement" name="block_wordspacing_measurement"></select></td>
            </tr>
          </table>
        </td>
      </tr>
  
      <tr>
        <td><label for="block_letterspacing">{#style_dlg.block_letterspacing}</label></td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><select id="block_letterspacing" name="block_letterspacing" class="mceEditableSelect"></select></td>
              <td>&nbsp;</td>
              <td><select id="block_letterspacing_measurement" name="block_letterspacing_measurement"></select></td>
            </tr>
          </table>
        </td>
      </tr>
  
      <tr>
        <td><label for="block_vertical_alignment">{#style_dlg.block_vertical_alignment}</label></td>
        <td><select id="block_vertical_alignment" name="block_vertical_alignment" class="mceEditableSelect"></select></td>
      </tr>
  
      <tr>
        <td><label for="block_text_align">{#style_dlg.block_text_align}</label></td>
        <td><select id="block_text_align" name="block_text_align" class="mceEditableSelect"></select></td>
      </tr>
  
      <tr>
        <td><label for="block_text_indent">{#style_dlg.block_text_indent}</label></td>
        <td>
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td><input type="text" id="block_text_indent" name="block_text_indent" /></td>
              <td>&nbsp;</td>
              <td><select id="block_text_indent_measurement" name="block_text_indent_measurement"></select></td>
            </tr>
          </table>
        </td>
      </tr>
  
      <tr>
        <td><label for="block_whitespace">{#style_dlg.block_whitespace}</label></td>
        <td><select id="block_whitespace" name="block_whitespace" class="mceEditableSelect"></select></td>
      </tr>
  
      <tr>
        <td><label for="block_display">{#style_dlg.block_display}</label></td>
        <td><select id="block_display" name="block_display" class="mceEditableSelect"></select></td>
      </tr>
    </table>