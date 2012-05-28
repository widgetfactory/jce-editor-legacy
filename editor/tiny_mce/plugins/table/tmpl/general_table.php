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
<h4>{#table_dlg.general_props}</h4>
<table border="0" cellpadding="4" cellspacing="0" width="100%">
    <tr>
        <td><label id="colslabel" for="cols">
                {#table_dlg.cols}</label></td>
        <td>
            <input id="cols" type="text" value="" size="3"
                   maxlength="3" class="required number min1 mceFocus" />
        </td>
        <td><label id="rowslabel" for="rows">
                {#table_dlg.rows}</label></td>
        <td>
            <input id="rows" type="text" value="" size="3"
                   maxlength="3" class="required number min1" />
        </td>
    </tr>
    <tr>
        <td><label id="cellpaddinglabel" for="cellpadding">
                {#table_dlg.cellpadding}</label></td>
        <td>
            <input id="cellpadding" type="text" value=""
                   size="3" maxlength="3" class="number" />
        </td>
        <td><label id="cellspacinglabel" for="cellspacing">
                {#table_dlg.cellspacing}</label></td>
        <td>
            <input id="cellspacing" type="text" value=""
                   size="3" maxlength="3" class="number" />
        </td>
    </tr>
    <tr>
        <td><label id="alignlabel" for="align">
                {#table_dlg.align}</label></td>
        <td>
            <select id="align" >
                <option value="">{#not_set}</option>
                <option value="center">{#table_dlg.align_middle}</option>
                <option value="left">{#table_dlg.align_left}</option>
                <option value="right">{#table_dlg.align_right}</option>
            </select></td>
        <td><label id="borderlabel" for="border">
                {#table_dlg.border}</label></td>
        <td>
            <input id="border" type="text" value="" size="3"
                   maxlength="3" onchange="TableDialog.changedBorder();" class="number" />
        </td>
    </tr>
    <tr id="width_row">
        <td><label id="widthlabel" for="width">
                {#table_dlg.width}</label></td>
        <td>
            <input type="text" id="width" value="" size="5"
                   onchange="TableDialog.changedSize();" class="size" />
        </td>
        <td><label id="heightlabel" for="height">
                {#table_dlg.height}</label></td>
        <td>
            <input type="text" id="height" value="" size="5"
                   onchange="TableDialog.changedSize();" class="size" />
        </td>
    </tr>
    <tr id="styleSelectRow">
        <td><label id="classlabel" for="class">
                {#class_name}</label></td>
        <td colspan="3">
            <select id="class" 
                    class="mceEditableSelect">
                <option value="" selected="selected">{#not_set}</option>
            </select></td>
    </tr>
    <tr>
        <td class="column1"><label for="caption">
                {#table_dlg.caption}</label></td>
        <td>
            <input id="caption" type="checkbox"
                   class="checkbox" value="true" />
        </td>
    </tr>
</table>
