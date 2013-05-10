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
<fieldset><legend><?php echo WFText::_('WF_FULLPAGE_META_PROPS'); ?></legend>

    <table border="0" cellpadding="4" cellspacing="0">
        <tr>
            <td class="nowrap"><label for="metatitle"><?php echo WFText::_('WF_FULLPAGE_META_TITLE'); ?></label>&nbsp;</td>
            <td><input type="text" id="metatitle" name="metatitle" value=""
                       class="mceFocus" /></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="metakeywords"><?php echo WFText::_('WF_FULLPAGE_META_KEYWORDS'); ?></label>&nbsp;</td>
            <td><textarea id="metakeywords" name="metakeywords" rows="4"></textarea></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="metadescription"><?php echo WFText::_('WF_FULLPAGE_META_DESCRIPTION'); ?></label>&nbsp;</td>
            <td><textarea id="metadescription" name="metadescription" rows="4"></textarea></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="metaauthor"><?php echo WFText::_('WF_FULLPAGE_AUTHOR'); ?></label>&nbsp;</td>
            <td><input type="text" id="metaauthor" name="metaauthor" value="" /></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="metacopyright"><?php echo WFText::_('WF_FULLPAGE_COPYRIGHT'); ?></label>&nbsp;</td>
            <td><input type="text" id="metacopyright" name="metacopyright"
                       value="" /></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="metarobots"><?php echo WFText::_('WF_FULLPAGE_META_ROBOTS'); ?></label>&nbsp;</td>
            <td><select id="metarobots" name="metarobots">
                    <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                    <option value="index,follow"><?php echo WFText::_('WF_FULLPAGE_META_INDEX_FOLLOW'); ?></option>
                    <option value="index,nofollow"><?php echo WFText::_('WF_FULLPAGE_META_INDEX_NOFOLLOW'); ?></option>
                    <option value="noindex,follow"><?php echo WFText::_('WF_FULLPAGE_META_NOINDEX_FOLLOW'); ?></option>
                    <option value="noindex,nofollow"><?php echo WFText::_('WF_FULLPAGE_META_NOINDEX_NOFOLLOW'); ?></option>
                </select></td>
        </tr>
    </table>
</fieldset>

<fieldset><legend><?php echo WFText::_('WF_FULLPAGE_LANGPROPS'); ?></legend>

    <table border="0" cellpadding="4" cellspacing="0">
        <tr>
            <td class="column1"><label for="docencoding"><?php echo WFText::_('WF_FULLPAGE_ENCODING'); ?></label></td>
            <td><select id="docencoding" name="docencoding">
                    <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                </select></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="doctype"><?php echo WFText::_('WF_FULLPAGE_DOCTYPES'); ?></label>&nbsp;</td>
            <td><select id="doctype" name="doctype">
                    <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                </select></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="langcode"><?php echo WFText::_('WF_FULLPAGE_LANGCODE'); ?></label>&nbsp;</td>
            <td><input type="text" id="langcode" name="langcode" value="" /></td>
        </tr>
        <tr>
            <td class="column1"><label for="langdir"><?php echo WFText::_('WF_FULLPAGE_LANGDIR'); ?></label></td>
            <td><select id="langdir" name="langdir">
                    <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                    <option value="ltr"><?php echo WFText::_('WF_FULLPAGE_LTR'); ?></option>
                    <option value="rtl"><?php echo WFText::_('WF_FULLPAGE_RTL'); ?></option>
                </select></td>
        </tr>
        <tr>
            <td class="nowrap"><label for="xml_pi"><?php echo WFText::_('WF_FULLPAGE_XML_PI'); ?></label>&nbsp;</td>
            <td><input type="checkbox" id="xml_pi" name="xml_pi" class="checkbox" /></td>
        </tr>
    </table>
</fieldset>
