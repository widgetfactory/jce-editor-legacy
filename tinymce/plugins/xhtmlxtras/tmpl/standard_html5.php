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
<div class="row-fluid">
    <label for="contenteditable" class="span3"><?php echo WFText::_('WF_LABEL_CONTENTEDITBALE');?></label>
    <select id="contenteditable" class="span8">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET');?></option>
            <option value="true"><?php echo WFText::_('WF_OPTION_YES');?></option>
            <option value="false"><?php echo WFText::_('WF_OPTION_NO');?></option>
            <option value="inherit"><?php echo WFText::_('WF_OPTION_INHERIT');?></option>
        </select>
    
</div>
<div class="row-fluid">
    <label for="draggable" class="span3"><?php echo WFText::_('WF_LABEL_DRAGGABLE');?></label>
    <select id="draggable" class="span8">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET');?></option>
            <option value="true"><?php echo WFText::_('WF_OPTION_YES');?></option>
            <option value="false"><?php echo WFText::_('WF_OPTION_NO');?></option>
            <option value="auto"><?php echo WFText::_('WF_OPTION_AUTO');?></option>
        </select>
    
</div>
<div class="row-fluid">
    <label for="hidden" class="span3"><?php echo WFText::_('WF_LABEL_HIDDEN');?></label>
    <select id="hidden" class="span8">
            <option value=""><?php echo WFText::_('WF_OPTION_NO');?></option>
            <option value="hidden"><?php echo WFText::_('WF_OPTION_YES');?></option>
        </select>
    
</div>
<div class="row-fluid">
    <label for="spellcheck" class="span3"><?php echo WFText::_('WF_LABEL_SPELLCHECK');?></label>
    <select id="spellcheck" class="span8">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET');?></option>
            <option value="true"><?php echo WFText::_('WF_OPTION_YES');?></option>
            <option value="false"><?php echo WFText::_('WF_OPTION_NO');?></option>
        </select>
    
</div>