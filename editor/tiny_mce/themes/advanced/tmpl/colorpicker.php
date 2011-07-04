<?php
/**
 * @version   $Id: colorpicker.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package     JCE
 * @copyright   Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
 * @copyright   Copyright (C) 2010 Moxiecode Systems AB. All rights reserved.
 * @author    Ryan Demmer
 * @author    Moxiecode
 * @license   http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see licence.txt
 * JCE is free software. This version may have been modified pursuant
 * to the GNU Lesser General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU Lesser General Public License or
 * other free or open source software licenses.
 */
defined( '_JEXEC' ) or die('ERROR_403');
?>
<div id="colorpicker">
	<div id="colorpicker_tabs">
		<ul>
			<li><a href="#colorpicker_picker" aria-controls="colorpicker_picker"><?php echo WFText::_('WF_COLORPICKER_PICKER');?></a></li>
			<li><a href="#colorpicker_web" aria-controls="colorpicker_web"><?php echo WFText::_('WF_COLORPICKER_PALETTE');?></a></li>
			<li><a href="#colorpicker_named" aria-controls="colorpicker_named"><?php echo WFText::_('WF_COLORPICKER_NAMED');?></a></li>
			<li><a href="#colorpicker_template" aria-controls="colorpicker_template"><?php echo WFText::_('WF_COLORPICKER_TEMPLATE');?></a></li>
		</ul>
		
		<div id="colorpicker_picker" title="<?php echo WFText::_('WF_COLORPICKER_PICKER');?>" data-type="picker"><!-- Will be filled with color wheel --></div>
		<div id="colorpicker_web" title="<?php echo WFText::_('WF_COLORPICKER_PALETTE');?>" data-type="web"><!-- Gets filled with web safe colors--></div>
		<div id="colorpicker_named" title="<?php echo WFText::_('WF_COLORPICKER_NAMED');?>" data-type="named"><!-- Gets filled with named colors--></div>
		<div id="colorpicker_template" title="<?php echo WFText::_('WF_COLORPICKER_TEMPLATE');?>" data-type="template"><!-- Gets filled with template colors--></div>
	</div>
	<div id="colorpicker_preview">
		<div id="colorpicker_preview_text">
			<input type="text" id="colorpicker_color" size="8" maxlength="8" value="#000000" class="ui-corner-all" aria-required="true" />
		</div>
		<div id="colorpicker_preview_color" style="background-color: rgb(0, 0, 0);" class="ui-widget-content ui-corner-all"></div>
	</div>
</div>
<input type="hidden" id="tmp_color" />	
<div class="mceActionPanel">
	<button type="button" id="insert" onclick="ColorPicker.insert();"><?php echo WFText::_('WF_LABEL_APPLY');?></button>
</div>