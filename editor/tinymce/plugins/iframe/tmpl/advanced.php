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
<table border="0" cellpadding="2">
    <tr>
        <td>
        <label for="style" class="hastip" title="<?php echo WFText::_('WF_LABEL_STYLE_DESC');?>">
            <?php echo WFText::_('WF_LABEL_STYLE');?>
        </label>
        </td>
        <td>
        <input id="style" type="text" value="" onchange="IframeDialog.setStyles();" />
        </td>
    </tr>
    <tr>
        <td>
        <label for="classlist" class="hastip" title="<?php echo WFText::_('WF_LABEL_CLASS_LIST_DESC');?>">
            <?php echo WFText::_('WF_LABEL_CLASS_LIST');?>
        </label>
        </td>
        <td>
        <select id="classlist" onchange="IframeDialog.setClasses(this.value);">
            <option value="">
                <?php echo WFText::_('WF_OPTION_NOT_SET');?>
            </option>
        </select>
        </td>
    </tr>
    <tr>
        <td>
        <label for="classes" class="hastip" title="<?php echo WFText::_('WF_LABEL_CLASSES_DESC');?>">
            <?php echo WFText::_('WF_LABEL_CLASSES');?>
        </label>
        </td>
        <td>
        <input id="classes" type="text" value="" />
        </td>
    </tr>
    <tr>
        <td>
        <label for="title" class="hastip" title="<?php echo WFText::_('WF_LABEL_TITLE_DESC');?>">
            <?php echo WFText::_('WF_LABEL_TITLE');?>
        </label>
        </td>
        <td>
        <input id="title" type="text" value="" />
        </td>
    </tr>
    <tr>
        <td>
        <label for="name" class="hastip" title="<?php echo WFText::_('WF_LABEL_NAME_DESC');?>">
            <?php echo WFText::_('WF_LABEL_NAME');?>
        </label>
        </td>
        <td>
        <input id="name" type="text" value="" />
        </td>
    </tr>
    <tr>
        <td>
        <label for="id" class="hastip" title="<?php echo WFText::_('WF_LABEL_ID_DESC');?>">
            <?php echo WFText::_('WF_LABEL_ID');?>
        </label>
        </td>
        <td>
        <input id="id" type="text" value="" />
        </td>
    </tr>
    <tr>
        <td>
        <label for="allowtransparency" class="hastip" title="<?php echo WFText::_('WF_IFRAME_ALLOWTRANSPARENCY_DESC');?>">
            <?php echo WFText::_('WF_IFRAME_ALLOWTRANSPARENCY');?>
        </label>
        </td>
        <td>
        <select id="allowtransparency">
            <option value="no">
                <?php echo WFText::_('WF_OPTION_NO');?>
            </option>
            <option value="yes">
                <?php echo WFText::_('WF_OPTION_YES');?>
            </option>
        </select>
        </td>
    </tr>
</table>