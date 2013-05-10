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
    <div class="row-fluid">
        <label for="text_font" class="span3"><?php echo WFText::_('WF_STYLES_TEXT_FONT'); ?></label>
        <select id="text_font" class="editable span9"></select>

    </div>
    <div class="row-fluid form-inline">
        <label for="text_size" class="span3"><?php echo WFText::_('WF_STYLES_TEXT_SIZE'); ?></label>
        <select id="text_size" class="editable span3"></select>
        <select id="text_size_measurement" class="span2"></select>
        <label for="text_weight" class="span2"><?php echo WFText::_('WF_STYLES_TEXT_WEIGHT'); ?></label>
        <select id="text_weight" class="span2"></select>
    </div>
    <div class="row-fluid form-inline">
        <label for="text_style" class="span3"><?php echo WFText::_('WF_STYLES_TEXT_STYLE'); ?></label>
        <select id="text_style" class="editable span3"></select>
        <label for="text_variant" class="span3"><?php echo WFText::_('WF_STYLES_TEXT_VARIANT'); ?></label>
        <select id="text_variant" class="span3"></select>
    </div>
    <div class="row-fluid form-inline">
        <label for="text_lineheight" class="span3"><?php echo WFText::_('WF_STYLES_TEXT_LINEHEIGHT'); ?></label>
        <select id="text_lineheight" class="editable span3"></select>
        <select id="text_lineheight_measurement" class="span3"></select>
        <label for="text_case" class="span3"><?php echo WFText::_('WF_STYLES_TEXT_CASE'); ?></label>
        <select id="text_case" class="span3"></select>
    </div>
    <div class="row-fluid">
        <label for="text_color" class="span3"><?php echo WFText::_('WF_STYLES_TEXT_COLOR'); ?></label>
        <input id="text_color" class="color span2" type="text" value="" />
    </div>
    <div class="row-fluid">
        <label class="span3"><?php echo WFText::_('WF_STYLES_TEXT_DECORATION'); ?></label>
        <label for="text_underline" class="checkbox inline"><input id="text_underline" class="checkbox" type="checkbox" /><?php echo WFText::_('WF_STYLES_TEXT_UNDERLINE'); ?></label>

        <label for="text_overline" class="checkbox inline"><input id="text_overline" class="checkbox" type="checkbox" /><?php echo WFText::_('WF_STYLES_TEXT_OVERLINE'); ?></label>

        <label for="text_linethrough" class="checkbox inline"><input id="text_linethrough" class="checkbox" type="checkbox" /><?php echo WFText::_('WF_STYLES_TEXT_STRIKETROUGH'); ?></label>
        <label for="text_blink" class="checkbox inline"><input id="text_blink" class="checkbox" type="checkbox" /><?php echo WFText::_('WF_STYLES_TEXT_BLINK'); ?></label>
        <label for="text_none" class="checkbox inline"><input id="text_none" class="checkbox" type="checkbox" onclick="StyleDialog.updateTextDecorations();" /><?php echo WFText::_('WF_STYLES_TEXT_NONE'); ?></label>
    </div>
</div>