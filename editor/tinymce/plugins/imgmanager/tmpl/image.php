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

$plugin = WFEditorPlugin::getInstance();
?>
<div class="container-fluid">
    <div class="row-fluid">
        <div class="span9">
            <div class="row-fluid">
                <label for="src" class="hastip span3" title="<?php echo WFText::_('WF_LABEL_URL_DESC'); ?>"><?php echo WFText::_('WF_LABEL_URL'); ?></label>
                <input type="text" id="src" value="" class="required span9" />
            </div>
            <div class="row-fluid">
                <label for="alt" class="hastip span3" title="<?php echo WFText::_('WF_LABEL_ALT_DESC'); ?>"><?php echo WFText::_('WF_LABEL_ALT'); ?></label>
                <td colspan="3"><input id="alt" type="text" value="" class="required span9" />
            </div>
            <div id="attributes-dimensions">
                <label for="width" class="hastip span3" title="<?php echo WFText::_('WF_LABEL_DIMENSIONS_DESC'); ?>"><?php echo WFText::_('WF_LABEL_DIMENSIONS'); ?></label>
                <input type="text" id="width" value="" class="span2" onchange="ImageManagerDialog.setDimensions('width', 'height');" /> x <input type="text" id="height" class="span2" value="" onchange="ImageManagerDialog.setDimensions('height', 'width');" />
                <input type="hidden" id="tmp_width" value=""  />
                <input type="hidden" id="tmp_height" value="" />
                <label for="constrain" class="checkbox inline"><input id="constrain" type="checkbox" class="checkbox" checked="checked" /><?php echo WFText::_('WF_LABEL_PROPORTIONAL'); ?></label>
                <span id="dim_loader">&nbsp;</span>
            </div>
            <div id="attributes-align" class="form-inline">
                <label for="align" class="hastip span3" title="<?php echo WFText::_('WF_LABEL_ALIGN_DESC'); ?>"><?php echo WFText::_('WF_LABEL_ALIGN'); ?></label>

                <div class="controls controls-row span9">
                    <select id="align" class="span6">
                        <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                        <option value="left"><?php echo WFText::_('WF_OPTION_ALIGN_LEFT'); ?></option>
                        <option value="right"><?php echo WFText::_('WF_OPTION_ALIGN_RIGHT'); ?></option>
                        <option value="top"><?php echo WFText::_('WF_OPTION_ALIGN_TOP'); ?></option>
                        <option value="middle"><?php echo WFText::_('WF_OPTION_ALIGN_MIDDLE'); ?></option>
                        <option value="bottom"><?php echo WFText::_('WF_OPTION_ALIGN_BOTTOM'); ?></option>
                    </select>

                    <label for="clear" class="hastip span2" title="<?php echo WFText::_('WF_LABEL_CLEAR_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CLEAR'); ?></label>

                    <select id="clear" disabled="disabled" class="span4">
                        <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                        <option value="none"><?php echo WFText::_('WF_OPTION_CLEAR_NONE'); ?></option>
                        <option value="both"><?php echo WFText::_('WF_OPTION_CLEAR_BOTH'); ?></option>
                        <option value="left"><?php echo WFText::_('WF_OPTION_CLEAR_LEFT'); ?></option>
                        <option value="right"><?php echo WFText::_('WF_OPTION_CLEAR_RIGHT'); ?></option>
                    </select>
                </div>
            </div>
        </div>
        <div class="preview span3">
            <img id="sample" src="<?php echo $plugin->image('sample.jpg', 'libraries'); ?>" alt="sample.jpg" />
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
        </div>
    </div>
    <div class="row-fluid">
        <div class="span12">
            <div id="attributes-margin" class="form-inline">
                <label for="margin" class="hastip span2" title="<?php echo WFText::_('WF_LABEL_MARGIN_DESC'); ?>"><?php echo WFText::_('WF_LABEL_MARGIN'); ?></label>
                <div class="controls controls-row span10">

                    <label for="margin_top" class="span1"><?php echo WFText::_('WF_OPTION_TOP'); ?></label>
                    <input type="text" id="margin_top" value="" size="3" maxlength="3" />
                    <label for="margin_right" class="span1"><?php echo WFText::_('WF_OPTION_RIGHT'); ?></label>
                    <input type="text" id="margin_right" value="" size="3" maxlength="3" />
                    <label for="margin_bottom" class="span1"><?php echo WFText::_('WF_OPTION_BOTTOM'); ?></label>
                    <input type="text" id="margin_bottom" value="" size="3" maxlength="3" />
                    <label for="margin_left" class="span1"><?php echo WFText::_('WF_OPTION_LEFT'); ?></label>
                    <input type="text" id="margin_left" value="" size="3" maxlength="3" />

                    <label for="margin_check" class="checkbox inline"><input type="checkbox" class="checkbox" id="margin_check" /><?php echo WFText::_('WF_LABEL_EQUAL'); ?></label>
                </div>
            </div>
            <div id="attributes-border" class="form-inline">
                <label for="border" class="hastip span2" title="<?php echo WFText::_('WF_LABEL_BORDER_DESC'); ?>"><?php echo WFText::_('WF_LABEL_BORDER'); ?></label>
                <input type="checkbox" class="checkbox inline" id="border">
                <div class="controls controls-row span10">
                    <label for="border_width" class="hastip span2" title="<?php echo WFText::_('WF_LABEL_BORDER_WIDTH_DESC'); ?>">
                        <?php echo WFText::_('WF_LABEL_WIDTH'); ?>
                    </label>
                    <select id="border_width" class="mceEditableSelect" data-pattern="[0-9]+" class="span3">
                        <option value="inherit"><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="thin"><?php echo WFText::_('WF_OPTION_BORDER_THIN'); ?></option>
                        <option value="medium"><?php echo WFText::_('WF_OPTION_BORDER_MEDIUM'); ?></option>
                        <option value="thick"><?php echo WFText::_('WF_OPTION_BORDER_THICK'); ?></option>
                    </select>
                    <label for="border_style" class="hastip span2" title="<?php echo WFText::_('WF_LABEL_BORDER_STYLE_DESC'); ?>"><?php echo WFText::_('WF_LABEL_STYLE'); ?></label>
                    <select id="border_style" class="span3">
                        <option value="inherit"><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                        <option value="none"><?php echo WFText::_('WF_OPTION_BORDER_NONE'); ?></option>
                        <option value="solid"><?php echo WFText::_('WF_OPTION_BORDER_SOLID'); ?></option>
                        <option value="dashed"><?php echo WFText::_('WF_OPTION_BORDER_DASHED'); ?></option>
                        <option value="dotted"><?php echo WFText::_('WF_OPTION_BORDER_DOTTED'); ?></option>
                        <option value="double"><?php echo WFText::_('WF_OPTION_BORDER_DOUBLE'); ?></option>
                        <option value="groove"><?php echo WFText::_('WF_OPTION_BORDER_GROOVE'); ?></option>
                        <option value="inset"><?php echo WFText::_('WF_OPTION_BORDER_INSET'); ?></option>
                        <option value="outset"><?php echo WFText::_('WF_OPTION_BORDER_OUTSET'); ?></option>
                        <option value="ridge"><?php echo WFText::_('WF_OPTION_BORDER_RIDGE'); ?></option>
                    </select>
                    <label for="border_color" class="hastip span2" title="<?php echo WFText::_('WF_LABEL_BORDER_COLOR_DESC'); ?>"><?php echo WFText::_('WF_LABEL_COLOR'); ?></label>
                    <input id="border_color" class="color span2" type="text" value="#000000" size="9" onchange="TinyMCE_Utils.updateColor(this);" />
                </div>
            </div>
        </div>
    </div>  
</div>