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
defined('WF_EDITOR') or die('RESTRICTED');
?>
<div class="container-fluid">
    <div class="row-fluid">
        <td>
            <label for="replace_panel_searchstring" class="span3"><?php echo WFText::_('WF_SEARCHREPLACE_FINDWHAT'); ?></label>
            <input type="text" id="replace_panel_searchstring" name="replace_panel_searchstring" class="span8" />
        
    </div>
    <div class="row-fluid">
        <td>
            <label for="replace_panel_replacestring" class="span3"><?php echo WFText::_('WF_SEARCHREPLACE_REPLACEWITH'); ?></label>
            <input type="text" id="replace_panel_replacestring" name="replace_panel_replacestring" class="span8" />
        
    </div>
    <div class="row-fluid">
            <label class="span3"><?php echo WFText::_('WF_SEARCHREPLACE_DIRECTION'); ?></label>
            
            <label for="replace_panel_backwardsu" class="radio inline">
                <input id="replace_panel_backwardsu" name="replace_panel_backwards" class="radio" type="radio" />
                <?php echo WFText::_('WF_SEARCHREPLACE_UP'); ?>
            </label>
            
            <label for="replace_panel_backwardsd" class="radio inline">
                <input id="replace_panel_backwardsd" name="replace_panel_backwards" class="radio" type="radio" checked="checked" />
                <?php echo WFText::_('WF_SEARCHREPLACE_DOWN'); ?>
            </label>
        
    </div>
    <div class="row-fluid">
            <label for="replace_panel_casesensitivebox" class="checkbox inline">
                <input id="replace_panel_casesensitivebox" name="replace_panel_casesensitivebox" class="checkbox" type="checkbox" />
                <?php echo WFText::_('WF_SEARCHREPLACE_MCASE'); ?>
            </label>
    </div>
</div>