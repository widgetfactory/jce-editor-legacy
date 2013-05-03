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

$element = $this->plugin->getElementName();

if ($element == 'del' || $element == 'ins') :
    echo $this->loadTemplate('datetime');
endif;
?>
<div class="container-fluid">
    <div class="row-fluid">
        <label for="title" class="span3"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_TITLE');?></label>
        <input id="title" type="text" value=""
                   class="span9" />
    </div>
    <div class="row-fluid">
        <label for="id"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_ID');?></label>
        <input id="id" type="text" value="" class="field" />
    </div>
    <div class="row-fluid">
        <label for="class"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_CLASS');?></label>
        <select id="class" class="field mceEditableSelect">
                <option value="">{#not_set}</option>
            </select>
    </div>
    <div class="row-fluid">
        <label for="class"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_STYLE');?></label>
        <input id="style" type="text" value="" class="field" />
    </div>
    <div class="row-fluid">
        <label for="dir"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_LANGDIR');?></label>
        <select id="dir" class="field">
                <option value="">{#not_set}</option>
                <option value="ltr"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_OPTION_LTR');?></option>
                <option value="rtl"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_OPTION_RTL');?></option>
            </select>
    </div>
    <div class="row-fluid">
        <label for="lang"><?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_LANGCODE');?></label>
        <input id="lang" type="text" value="" class="field" />
        
    </div>
<?php
if ($this->plugin->isHTML5()) :
    echo $this->loadTemplate('html5');
endif;
?>
</div>