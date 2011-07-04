<?php
/**
* @version    $Id: standard_datetime.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
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
<h4>{#xhtmlxtras_dlg.fieldset_general_tab}</h4>
<table>
    <tr>
        <td class="label">
        <label for="datetime">
            {#xhtmlxtras_dlg.attribute_label_datetime}
        </label>
        </td>
        <td>
        <input id="datetime" type="text" value="" maxlength="19" class="field mceFocus" />
        <a href="javascript:;" onclick="XHTMLXtrasDialog.insertDateTime('datetime');" class="browse">
        <span class="datetime" title="{#xhtmlxtras_dlg.insert_date}"></span>
        </a>
        </td>
    </tr>
    <tr>
        <td class="label">
        <label for="cite">
            {#xhtmlxtras_dlg.attribute_label_cite}
        </label>
        </td>
        <td>
        <input id="cite" type="text" value="" class="field" />
        </td>
    </tr>
</table>