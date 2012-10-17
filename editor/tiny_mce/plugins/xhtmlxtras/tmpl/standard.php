<?php
/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2012 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');

$plugin = WFXHTMLXtrasPlugin::getInstance();

$element = $plugin->getElementName();

if ($element == 'del' || $element == 'ins') :
    echo $this->loadTemplate('datetime');
endif;
?>
<h4><?php echo WFText::_('WF_XHTMLXTRAS_FIELDSET_ATTRIB_TAB');?></h4>

<div class="control-group">
    <label class="control-label" for="title"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_TITLE');?></label>
    <div class="controls">
        <input type="text" id="title" placeholder="">
    </div>
</div>

<div class="control-group">
    <label class="control-label" for="id"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_ID');?></label>
    <div class="controls">
        <input type="text" id="id" placeholder="">
    </div>
</div>

<div class="control-group">
    <label class="control-label" for="class"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_CLASS');?></label>
    <div class="controls">
        <select id="class" class="editable">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET');?></option>
        </select>
    </div>
</div>

<div class="control-group">
    <label class="control-label" for="style"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_STYLE');?></label>
    <div class="controls">
        <input type="text" id="style" placeholder="">
    </div>
</div>

<div class="control-group">
    <label class="control-label" for="class"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_CLASS');?></label>
    <div class="controls">
        <select id="dir" class="field">
                <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET');?></option>
                <option value="ltr"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_OPTION_LTR');?></option>
                <option value="rtl"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_OPTION_RTL');?></option>
            </select>
    </div>
</div>

<div class="control-group">
    <label class="control-label" for="lang"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_LANGCODE');?></label>
    <div class="controls">
        <input type="text" id="lang" placeholder="">
    </div>
</div>

<?php
if ($plugin->isHTML5()) :
    echo $this->loadTemplate('html5');
endif;
?>
</table>