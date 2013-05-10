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
        <label for="id" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_ID_DESC'); ?>"><?php echo WFText::_('WF_LABEL_ID'); ?></label>
        <input id="id" type="text" class="span8" value="" /> 
    </div>
    <div class="row-fluid">
        <label for="style" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_STYLE_DESC'); ?>"><?php echo WFText::_('WF_LABEL_STYLE'); ?></label>
        <input type="text" class="span8" id="style" value="" />
    </div>
    <div class="row-fluid">
        <label for="classlist" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_CLASS_LIST_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CLASS_LIST'); ?></label>

        <select id="classlist" onchange="LinkDialog.setClasses(this.value);" class="span8">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
        </select>

    </div>
    <div class="row-fluid">
        <label for="classes" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_CLASSES_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CLASSES'); ?></label>
        <input type="text" class="span8" id="classes" value="" />
    </div>
    <div class="row-fluid">
        <label for="dir" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_DIR_DESC'); ?>"><?php echo WFText::_('WF_LABEL_DIR'); ?></label>

        <select id="dir" class="span8"> 
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
            <option value="ltr"><?php echo WFText::_('WF_OPTION_LTR'); ?></option>
            <option value="rtl"><?php echo WFText::_('WF_OPTION_RTL'); ?></option>
        </select>

    </div>
    <div class="row-fluid">
        <label for="hreflang" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_HREFLANG_DESC'); ?>"><?php echo WFText::_('WF_LABEL_HREFLANG'); ?></label>
        <input type="text" class="span8" id="hreflang" value="" />
    </div>
    <div class="row-fluid">
        <label for="lang" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_LANG_DESC'); ?>"><?php echo WFText::_('WF_LABEL_LANG'); ?></label>
        <input id="lang" type="text" class="span8" value="" /> 
    </div>
    <div class="row-fluid">
        <label for="charset" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_CHARSET_DESC'); ?>"><?php echo WFText::_('WF_LABEL_CHARSET'); ?></label>
        <input type="text" class="span8" id="charset" value="" />
    </div>
    <div class="row-fluid">
        <label for="type" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_MIME_TYPE_DESC'); ?>"><?php echo WFText::_('WF_LABEL_MIME_TYPE'); ?></label>
        <input type="text" class="span8" id="type" value="" />
    </div>
    <div class="row-fluid">
        <label for="rel" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_REL_DESC'); ?>"><?php echo WFText::_('WF_LABEL_REL'); ?></label>
        <select id="rel" class="editable span7">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
            <option value="nofollow">No Follow</option>
            <option value="alternate">Alternate</option> 
            <option value="designates">Designates</option> 
            <option value="stylesheet">Stylesheet</option> 
            <option value="start">Start</option> 
            <option value="next">Next</option> 
            <option value="prev">Prev</option> 
            <option value="contents">Contents</option> 
            <option value="index">Index</option> 
            <option value="glossary">Glossary</option> 
            <option value="copyright">Copyright</option> 
            <option value="chapter">Chapter</option> 
            <option value="subsection">Subsection</option> 
            <option value="appendix">Appendix</option> 
            <option value="help">Help</option> 
            <option value="bookmark">Bookmark</option> 
        </select> 

    </div>
    <div class="row-fluid">
        <label for="rev" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_REV_DESC'); ?>"><?php echo WFText::_('WF_LABEL_REV'); ?></label>
        <select id="rev" class="span8"> 
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
            <option value="alternate">Alternate</option> 
            <option value="designates">Designates</option> 
            <option value="stylesheet">Stylesheet</option> 
            <option value="start">Start</option> 
            <option value="next">Next</option> 
            <option value="prev">Prev</option> 
            <option value="contents">Contents</option> 
            <option value="index">Index</option> 
            <option value="glossary">Glossary</option> 
            <option value="copyright">Copyright</option> 
            <option value="chapter">Chapter</option> 
            <option value="subsection">Subsection</option> 
            <option value="appendix">Appendix</option> 
            <option value="help">Help</option> 
            <option value="bookmark">Bookmark</option>
        </select> 

    </div>
    <div class="row-fluid">
        <label for="tabindex" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_TABINDEX_DESC'); ?>"><?php echo WFText::_('WF_LABEL_TABINDEX'); ?></label>
        <input type="text" class="span8" id="tabindex" value="" />
    </div>
    <div class="row-fluid">
        <label for="accesskey" class="hastip span4"title="<?php echo WFText::_('WF_LABEL_ACCESSKEY_DESC'); ?>"><?php echo WFText::_('WF_LABEL_ACCESSKEY'); ?></label>
        <input type="text" class="span8" id="accesskey" value="" />
    </div>
</div>