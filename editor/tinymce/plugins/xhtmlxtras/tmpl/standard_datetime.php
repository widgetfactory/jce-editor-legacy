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
        
        <label for="datetime" class="span3">
            <?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_DATETIME');?>
        </label>
        
        <div class="input-append span9">
            <input id="datetime" type="text" value="" maxlength="19" class="span10" />
            <button class="btn" type="button" title="<?php echo WFText::_('WF_XHTMLXTRAS_INSERT_DATE');?>"><i class="icon-clock"></i></button>
        </div>        
    </div>
    <div class="row-fluid">
        
        <label for="cite" class="span3">
            <?php echo WFText::_('WF_XHTMLXTRAS_ATTRIBUTE_LABEL_CITE');?>
        </label>
        
        
        <input id="cite" type="text" value="" class="span9" />
        
    </div>
</div>