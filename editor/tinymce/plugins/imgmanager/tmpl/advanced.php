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
        <label for="style" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_STYLE_DESC'); ?>"><?php echo WFText::_('WF_LABEL_STYLE'); ?></label>
        <input id="style" type="text" class="span8" value="" onchange="ImageManagerDialog.setStyles();" />
    </div>
    <div class="row-fluid">
        <label for="classlist" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_CLASS_LIST_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CLASS_LIST'); ?></label>

        <select id="classlist" class="span8" onchange="ImageManagerDialog.setClasses(this.value);">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
        </select>

    </div>
    <div class="row-fluid">
        <label for="title" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_CLASSES_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CLASSES'); ?></label>
        <input id="classes" type="text" class="span8" value="" />
    </div>
    <div class="row-fluid">
        <label for="title" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_TITLE_DESC'); ?>"><?php echo WFText::_('WF_LABEL_TITLE'); ?></label>
        <input id="title" type="text" class="span8" value="" />
    </div>
    <div class="row-fluid">
        <label for="id" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_ID_DESC'); ?>"><?php echo WFText::_('WF_LABEL_ID'); ?></label>
        <input id="id" type="text" class="span8" value="" />
    </div>

    <div class="row-fluid">
        <label for="dir" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_DIR_DESC'); ?>"><?php echo WFText::_('WF_LABEL_DIR'); ?></label>

        <select id="dir" class="span8" onchange="ImageManagerDialog.updateStyles();">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
            <option value="ltr"><?php echo WFText::_('WF_OPTION_LTR'); ?></option>
            <option value="rtl"><?php echo WFText::_('WF_OPTION_RTL'); ?></option>
        </select>

    </div>

    <div class="row-fluid">
        <label for="lang" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_LANG_DESC'); ?>"><?php echo WFText::_('WF_LABEL_LANG'); ?></label>
        <input id="lang" type="text" class="span8" value="" />
    </div>

    <div class="row-fluid">
        <label for="usemap" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_USEMAP_DESC'); ?>"><?php echo WFText::_('WF_LABEL_USEMAP'); ?></label>
        <input id="usemap" type="text" class="span8" value="" />
    </div>

    <div class="row-fluid">
        <label for="longdesc" class="hastip span4" title="<?php echo WFText::_('WF_LABEL_LONGDESC_DESC'); ?>"><?php echo WFText::_('WF_LABEL_LONGDESC'); ?></label>
        <input id="longdesc" type="text" class="span8" value="" class="browser image" />
    </div>
</div>