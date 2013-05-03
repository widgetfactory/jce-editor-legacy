<?php
/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');
?>
<div class="container-fluid">
    <div class="row-fluid controls controls-row">
        <label id="colslabel" for="cols">
            <?php echo WFText::_('WF_TABLE_COLS'); ?></label>

        <input id="cols" type="text" value="" size="3"
               maxlength="3" class="required number min1 mceFocus input-mini" />

        <label id="rowslabel" for="rows">
            <?php echo WFText::_('WF_TABLE_ROWS'); ?></label>

        <input id="rows" type="text" value="" size="3"
               maxlength="3" class="required number min1 input-mini" />

    </div>
    <div class="row-fluid controls controls-row">
        <label id="cellpaddinglabel" for="cellpadding">
            <?php echo WFText::_('WF_TABLE_CELLPADDING'); ?></label>

        <input id="cellpadding" type="text" value=""
               size="3" maxlength="3" class="number input-mini" />

        <label id="cellspacinglabel" for="cellspacing">
            <?php echo WFText::_('WF_TABLE_CELLSPACING'); ?></label>

        <input id="cellspacing" type="text" value=""
               size="3" maxlength="3" class="number input-mini" />

    </div>
    <div class="row-fluid controls controls-row">
        <label id="alignlabel" for="align">
            <?php echo WFText::_('WF_TABLE_ALIGN'); ?></label>

        <select id="align" class="span1">
            <option value="">{#not_set}</option>
            <option value="center"><?php echo WFText::_('WF_TABLE_ALIGN_MIDDLE'); ?></option>
            <option value="left"><?php echo WFText::_('WF_TABLE_ALIGN_LEFT'); ?></option>
            <option value="right"><?php echo WFText::_('WF_TABLE_ALIGN_RIGHT'); ?></option>
        </select>
        <label id="borderlabel" for="border">
            <?php echo WFText::_('WF_TABLE_BORDER'); ?></label>

        <input id="border" type="text" value="" size="3"
               maxlength="3" onchange="TableDialog.changedBorder();" class="number input-mini" />

    </div>
    <div class="row-fluid controls controls-row" id="width_row">
        <label id="widthlabel" for="width">
            <?php echo WFText::_('WF_TABLE_WIDTH'); ?></label>

        <input type="text" id="width" value="" size="5"
               onchange="TableDialog.changedSize();" class="size input-mini" />

        <label id="heightlabel" for="height">
            <?php echo WFText::_('WF_TABLE_HEIGHT'); ?></label>

        <input type="text" id="height" value="" size="5"
               onchange="TableDialog.changedSize();" class="size input-mini" />

    </div>
    <div class="row-fluid controls controls-row">
        <label for="caption">
            <?php echo WFText::_('WF_TABLE_CAPTION'); ?></label>

        <input id="caption" type="checkbox"
               class="checkbox" value="true" />

    </div>
</div>
