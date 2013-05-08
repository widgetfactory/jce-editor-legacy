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
    <div class="row-fluid">
        <label for="onmouseover" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_MOUSEOVER_DESC'); ?>">
<?php echo WFText::_('WF_LABEL_MOUSEOVER'); ?>
        </label>
        <input id="onmouseover" type="text" value="" class="span8" />
    </div>
    <div class="row-fluid">
        <label for="onmouseout" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_MOUSEOUT_DESC'); ?>">
<?php echo WFText::_('WF_LABEL_MOUSEOUT'); ?>
        </label>
        <input id="onmouseout" type="text" value="" class="span8" />
    </div>
</div>