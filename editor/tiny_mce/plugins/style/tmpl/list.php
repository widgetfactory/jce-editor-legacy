<?php
/**
* @version    $Id: list.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
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
        <td><label for="list_type">{#style_dlg.list_type}</label></td>
        <td><select id="list_type" name="list_type" class="mceEditableSelect"></select></td>
      </tr>
  
      <tr>
        <td><label for="list_bullet_image">{#style_dlg.bullet_image}</label></td>
        <td><input id="list_bullet_image" name="list_bullet_image" type="text" class="browser image" /></td>
      </tr>
  
      <tr>
        <td><label for="list_position">{#style_dlg.position}</label></td>
        <td><select id="list_position" name="list_position" class="mceEditableSelect"></select></td>
      </tr>
    </table>