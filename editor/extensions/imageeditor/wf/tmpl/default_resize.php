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

$editor = WFImageEditorExtension::getInstance('wf');

?>
<h3 id="transform-resize" data-action="resize">
<a href="#">
<?php echo WFText::_('WF_IMGMANAGER_EXT_TRANSFORM_RESIZE');?>
</a>
</h3>
<div>
	<div class="row">
		<label for="resize_width">
			<?php echo WFText::_('WF_LABEL_WIDTH');?>
		</label>
		<input type="text" id="resize_width" class="width" value="" />
		<!--select id="resize_width_unit">
			<option value="px">px</option>
			<option value="%">%</option>
		</select-->
		<div id="resize_constrain" class="constrain">
			<span class="checkbox checked" aria-checked="true" role="checkbox"></span>
		</div>
	</div>
	<div class="row">
		<label for="resize_height">
			<?php echo WFText::_('WF_LABEL_HEIGHT');?>
		</label>
		<input type="text" id="resize_height" value="" class="height" />
		<!--select id="resize_height_unit">
			<option value="px">px</option>
			<option value="%">%</option>
		</select-->
	</div>
	<div class="row">
		<label for="resize_presets">
			<?php echo WFText::_('WF_LABEL_PRESETS');?>
		</label>
		<select id="resize_presets">
			<?php foreach ($editor->getPresetsList('resize') as $option):?>
				<option value="<?php echo $option;?>"><?php echo $option;?></option>
			<?php endforeach;?>
		</select>
	</div>
	<div class="row">
		<button id="resize_apply" class="apply" data-function="resize">
			<?php echo WFText::_('WF_LABEL_APPLY');?>
		</button>
		<button id="resize_reset" class="reset" data-function="resize">
			<?php echo WFText::_('WF_LABEL_RESET');?>
		</button>
	</div>
</div>