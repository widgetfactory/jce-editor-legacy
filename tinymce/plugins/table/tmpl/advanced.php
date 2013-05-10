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
    <div class="row-fluid controls">
        <label for="classlist" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_CLASS_LIST_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CLASS_LIST'); ?></label>

        <select id="classlist" onchange="TableDialog.setClasses(this.value);" class="span8">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
        </select>

    </div>
    <div class="row-fluid controls">
        <label for="title" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_CLASSES_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CLASSES'); ?></label>
        <input id="classes" type="text" value="" class="span8" />
    </div>

    <div class="row-fluid controls">
        <label for="id" class="span4">
            <?php echo WFText::_('WF_TABLE_ID'); ?></label>

        <input id="id" type="text" value="" class="span8" />

    </div>
    <div class="row-fluid controls">
        <label for="summary" class="span4">
            <?php echo WFText::_('WF_TABLE_SUMMARY'); ?></label>

        <input id="summary" type="text" value=""
               class="span8" />

    </div>
    <div class="row-fluid controls">
        <label for="style" class="span4">
            <?php echo WFText::_('WF_TABLE_STYLE'); ?></label>

        <input type="text" id="style" value=""
               class="span8" onchange="TableDialog.changedStyle();" />

    </div>
    <div class="row-fluid controls">
        <label id="langlabel" for="lang" class="span4">
            <?php echo WFText::_('WF_TABLE_LANGCODE'); ?></label>

        <input id="lang" type="text" value="" class="span8" />

    </div>
    <div class="row-fluid controls">
        <label for="backgroundimage" class="span4">
            <?php echo WFText::_('WF_TABLE_BGIMAGE'); ?></label>

        <input id="backgroundimage" type="text"
               value="" class="browser image"
               onchange="TableDialog.changedBackgroundImage();" />
    </div>
    <?php if ($this->plugin->getContext() == 'table') :
        ?>
        <div class="row-fluid controls">
            <label for="tframe" class="span4">
                <?php echo WFText::_('WF_TABLE_FRAME'); ?></label>

            <select id="tframe" class="span8">
                <option value="">{#not_set}</option>
                <option value="void"><?php echo WFText::_('WF_TABLE_RULES_VOID'); ?></option>
                <option value="above"><?php echo WFText::_('WF_TABLE_RULES_ABOVE'); ?></option>
                <option value="below"><?php echo WFText::_('WF_TABLE_RULES_BELOW'); ?></option>
                <option value="hsides"><?php echo WFText::_('WF_TABLE_RULES_HSIDES'); ?></option>
                <option value="lhs"><?php echo WFText::_('WF_TABLE_RULES_LHS'); ?></option>
                <option value="rhs"><?php echo WFText::_('WF_TABLE_RULES_RHS'); ?></option>
                <option value="vsides"><?php echo WFText::_('WF_TABLE_RULES_VSIDES'); ?></option>
                <option value="box"><?php echo WFText::_('WF_TABLE_RULES_BOX'); ?></option>
                <option value="border"><?php echo WFText::_('WF_TABLE_RULES_BORDER'); ?></option>
            </select>
        </div>
        <div class="row-fluid controls">
            <label for="rules" class="span4">
                <?php echo WFText::_('WF_TABLE_RULES'); ?></label>

            <select id="rules" class="span8">
                <option value="">{#not_set}</option>
                <option value="none"><?php echo WFText::_('WF_TABLE_FRAME_NONE'); ?></option>
                <option value="groups"><?php echo WFText::_('WF_TABLE_FRAME_GROUPS'); ?></option>
                <option value="rows"><?php echo WFText::_('WF_TABLE_FRAME_ROWS'); ?></option>
                <option value="cols"><?php echo WFText::_('WF_TABLE_FRAME_COLS'); ?></option>
                <option value="all"><?php echo WFText::_('WF_TABLE_FRAME_ALL'); ?></option>
            </select>
        </div>
    <?php endif; ?>
    <div class="row-fluid controls">
        <label for="dir" class="span4">
            <?php echo WFText::_('WF_TABLE_LANGDIR'); ?></label>

        <select id="dir" class="span8">
            <option value="">{#not_set}</option>
            <option value="ltr"><?php echo WFText::_('WF_TABLE_LTR'); ?></option>
            <option value="rtl"><?php echo WFText::_('WF_TABLE_RTL'); ?></option>
        </select>
    </div>
    <div class="row-fluid controls">
        <label for="bordercolor" class="span4">
            <?php echo WFText::_('WF_TABLE_BORDERCOLOR'); ?></label>

        <input id="bordercolor" type="text" value=""
               size="9" class="color span3" onchange="TableDialog.changedColor();"/>
    </div>
    <div class="row-fluid controls">
        <label for="bgcolor" class="span4">
            <?php echo WFText::_('WF_TABLE_BGCOLOR'); ?></label>

        <input id="bgcolor" type="text" value="" size="9"
               class="color span3" onchange="TableDialog.changedColor();" />
    </div>
</div>