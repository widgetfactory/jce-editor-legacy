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
        <label for="background_color" class="span3"><?php echo WFText::_('WF_STYLES_BACKGROUND_COLOR'); ?></label>
        <input id="background_color"  class="color span3" type="text" value="" size="9" />
    </div>
    <div class="row-fluid">
        <label for="background_image" class="span3"><?php echo WFText::_('WF_STYLES_BACKGROUND_IMAGE'); ?></label>
        <input id="background_image"  class="browser image" type="text" /> 
    </div>

    <div class="row-fluid">
        <label for="background_repeat" class="span3"><?php echo WFText::_('WF_STYLES_BACKGROUND_REPEAT'); ?></label>
        <select id="background_repeat" class="editable span8"></select>
    </div>

    <div class="row-fluid">
        <label for="background_attachment" class="span3"><?php echo WFText::_('WF_STYLES_BACKGROUND_ATTACHMENT'); ?></label>
        <select id="background_attachment"  class="editable span8"></select>
    </div>

    <div class="row-fluid">
        <label for="background_hpos" class="span3"><?php echo WFText::_('WF_STYLES_BACKGROUND_HPOS'); ?></label>
        <select id="background_hpos"  class="editable span5"></select>
        <select id="background_hpos_measurement" class="span3"></select>
    </div>
    <div class="row-fluid">
        <label for="background_vpos" class="span3"><?php echo WFText::_('WF_STYLES_BACKGROUND_VPOS'); ?></label>
        <select id="background_vpos"  class="editable span5"></select>
        <select id="background_vpos_measurement" class="span3"></select>
    </div>
</div>

