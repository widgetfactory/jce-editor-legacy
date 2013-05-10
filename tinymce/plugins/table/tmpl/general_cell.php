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
    <div class="row-fluid form-inline">
        <div class="controls controls-row">
            <label for="align" class="span3">
                <?php echo WFText::_('WF_TABLE_ALIGN'); ?></label>

            <select id="align" class="span3">
                <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                <option value="center"><?php echo WFText::_('WF_TABLE_ALIGN_MIDDLE'); ?></option>
                <option value="left"><?php echo WFText::_('WF_TABLE_ALIGN_LEFT'); ?></option>
                <option value="right"><?php echo WFText::_('WF_TABLE_ALIGN_RIGHT'); ?></option>
            </select>
            <label for="celltype" class="span3">
                <?php echo WFText::_('WF_TABLE_CELL_TYPE'); ?></label>

            <select id="celltype" class="span3">
                <option value="td"><?php echo WFText::_('WF_TABLE_TD'); ?></option>
                <option value="th"><?php echo WFText::_('WF_TABLE_TH'); ?></option>
            </select>
        </div>
    </div>
    <div class="row-fluid form-inline">
        <div class="controls controls-row">
        
        <label for="valign" class="span3">
            <?php echo WFText::_('WF_TABLE_VALIGN'); ?></label>

        <select id="valign" class="span3">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
            <option value="top"><?php echo WFText::_('WF_TABLE_ALIGN_TOP'); ?></option>
            <option value="middle"><?php echo WFText::_('WF_TABLE_ALIGN_MIDDLE'); ?></option>
            <option value="bottom"><?php echo WFText::_('WF_TABLE_ALIGN_BOTTOM'); ?></option>
        </select>
        <label for="scope" class="span3">
            <?php echo WFText::_('WF_TABLE_SCOPE'); ?></label>

        <select id="scope" class="span3">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
            <option value="col"><?php echo WFText::_('WF_TABEL_COL'); ?></option>
            <option value="row"><?php echo WFText::_('WF_TABEL_ROW'); ?></option>
            <option value="rowgroup"><?php echo WFText::_('WF_TABLE_ROWGROUP'); ?></option>
            <option value="colgroup"><?php echo WFText::_('WF_TABLE_COLGROUP'); ?></option>
        </select>
        </div>
    </div>
    <div class="row-fluid form-inline">
        <div class="controls controls-row">
            <label for="width" class="span3">
                <?php echo WFText::_('WF_TABLE_WIDTH'); ?></label>

            <input id="width" type="text" value="" size="4" class="span3"
                   maxlength="4" onchange="TableDialog.changedSize();" />

            <label for="height" class="span3">
                <?php echo WFText::_('WF_TABLE_HEIGHT'); ?></label>

            <input id="height" type="text" value="" size="4" class="span3"
                   maxlength="4" onchange="TableDialog.changedSize();" />
        </div>
    </div>
</div>