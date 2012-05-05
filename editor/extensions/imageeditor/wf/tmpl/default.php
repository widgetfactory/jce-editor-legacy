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
<form onsubmit="return false;">
    <div id="editor" class="offleft">
        <div id="editor-image"><!-- Edited image goes here --></div>
        <div id="editor-tools">
            <div id="tabs">
                <ul>
                    <li><a href="#transform_tab"><?php echo WFText::_('WF_IMGMANAGER_EXT_EDITOR_TRANSFORM'); ?></a></li>
                    <li><a href="#effects_tab"><?php echo WFText::_('WF_IMGMANAGER_EXT_EDITOR_EFFECTS'); ?></a></li>
                </ul>
                <div id="transform_tab">
                    <?php
                    echo $this->loadTemplate('resize');
                    echo $this->loadTemplate('crop');
                    echo $this->loadTemplate('rotate');
                    ?>
                </div>
                <div id="effects_tab">
                    <?php
                    echo $this->loadTemplate('effects');
                    ?>
                </div>
            </div>
            <div class="actions">
                <button class="revert"><?php echo WFText::_('WF_LABEL_REVERT'); ?></button>
                <button class="undo"><?php echo WFText::_('WF_LABEL_UNDO'); ?></button>
                <button class="save"><?php echo WFText::_('WF_LABEL_SAVE'); ?></button>
            </div>
        </div>
    </div>
    <input type="hidden" name="<?php echo WFToken::getToken(); ?>" value="1" />
</form>
