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
    <div class="row-fluid form-inline">
        <label class="span8"><?php echo WFText::_('WF_TABLE_COLS'); ?>:</label>
        <input type="text" id="numcols" value="" class="number min1 span3" />
    </div>
    <div class="row-fluid form-inline">
        <label class="span8"><?php echo WFText::_('WF_TABLE_ROWS'); ?>:</label>
        <input type="text" id="numrows" value="" class="number min1 span3" />
    </div>
</div>
</div>