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
<h3 id="transform-crop" data-action="crop">
<a href="#">
<?php echo WFText::_('WF_IMGMANAGER_EXT_TRANSFORM_CROP');?>
</a>
</h3>
<div>
	<div class="row">
		<input type="checkbox" id="crop_constrain" />
		<label for="crop_constrain">
			<?php echo WFText::_('WF_LABEL_CONSTRAIN');?>
		</label>

		<select id="crop_presets">
			<?php foreach ($editor->getPresetsList('crop') as $option):?>
				<option value="<?php echo $option;?>"><?php echo $option;?></option>
			<?php endforeach;?>
		</select>
	</div>
	<div class="row">
		<button id="crop_apply" class="apply" data-function="crop">
			<?php echo WFText::_('WF_LABEL_APPLY');?>
		</button>
		<button id="crop_reset" class="reset" data-function="crop">
			<?php echo WFText::_('WF_LABEL_RESET');?>
		</button>
	</div>
</div>