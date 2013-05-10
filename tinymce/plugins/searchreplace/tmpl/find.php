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

        <label for="find_panel_searchstring" class="span3"><?php echo WFText::_('WF_SEARCHREPLACE_FINDWHAT'); ?></label>
        <input type="text" id="find_panel_searchstring" class="span8" />

    </div>
    <div class="row-fluid">
        <label class="span3"><?php echo WFText::_('WF_SEARCHREPLACE_DIRECTION'); ?></label>
        
        <label for="find_panel_backwardsu" class="radio inline">
            <input id="find_panel_backwardsu" name="find_panel_backwards" class="radio" type="radio" />
            <?php echo WFText::_('WF_SEARCHREPLACE_UP'); ?>
        </label>
        
        <label for="find_panel_backwardsd" class="radio inline">
            <input id="find_panel_backwardsd" name="find_panel_backwards" class="radio" type="radio" checked="checked" />
            <?php echo WFText::_('WF_SEARCHREPLACE_DOWN'); ?>
        </label>

    </div>
    <div class="row-fluid">
        <label for="find_panel_casesensitivebox" class="checkbox inline">
            <input id="find_panel_casesensitivebox" class="checkbox" type="checkbox" />
            <?php echo WFText::_('WF_SEARCHREPLACE_MCASE'); ?>
        </label>
    </div>
</div>
