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
<fieldset><legend><?php echo WFText::_('WF_FULLPAGE_APPEARANCE_TEXTPROPS'); ?></legend>

    <table border="0" cellpadding="4" cellspacing="0">
        <tr>
            <td class="column1"><label for="fontface"><?php echo WFText::_('WF_FULLPAGE_FONTFACE'); ?></label></td>
            <td><select id="fontface" name="fontface"
                        onchange="FullPageDialog.changedStyleProp();">
                    <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                </select></td>
        </tr>

        <tr>
            <td class="column1"><label for="fontsize"><?php echo WFText::_('WF_FULLPAGE_FONTSIZE'); ?></label></td>
            <td><select id="fontsize" name="fontsize"
                        onchange="FullPageDialog.changedStyleProp();">
                    <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                </select></td>
        </tr>

        <tr>
            <td class="column1"><label for="textcolor"><?php echo WFText::_('WF_FULLPAGE_TEXTCOLOR'); ?></label></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><input id="textcolor" name="textcolor" type="text" value="" class="color"
                                   size="9"
                                   onchange="updateColor('textcolor_pick','textcolor');FullPageDialog.changedStyleProp();" /></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</fieldset>

<fieldset><legend><?php echo WFText::_('WF_FULLPAGE_APPEARANCE_BGPROPS'); ?></legend>

    <table border="0" cellpadding="4" cellspacing="0">
        <tr>
            <td class="column1"><label for="bgimage"><?php echo WFText::_('WF_FULLPAGE_BGIMAGE'); ?></label></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><input id="bgimage" name="bgimage" type="text" value="" class="browser image"
                                   onchange="FullPageDialog.changedStyleProp();" /></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="column1"><label for="bgcolor"><?php echo WFText::_('WF_FULLPAGE_BGCOLOR'); ?></label></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><input id="bgcolor" name="bgcolor" type="text" value="" size="9" class="color"
                                   onchange="updateColor('bgcolor_pick','bgcolor');FullPageDialog.changedStyleProp();" /></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</fieldset>

<fieldset><legend><?php echo WFText::_('WF_FULLPAGE_APPEARANCE_MARGINPROPS'); ?></legend>

    <table border="0" cellpadding="4" cellspacing="0">
        <tr>
            <td class="column1"><label for="leftmargin"><?php echo WFText::_('WF_FULLPAGE_LEFT_MARGIN'); ?></label></td>
            <td><input id="leftmargin" name="leftmargin" type="text" value=""
                       onchange="FullPageDialog.changedStyleProp();" /></td>
            <td class="column1"><label for="rightmargin"><?php echo WFText::_('WF_FULLPAGE_RIGHT_MARGIN'); ?></label></td>
            <td><input id="rightmargin" name="rightmargin" type="text" value=""
                       onchange="FullPageDialog.changedStyleProp();" /></td>
        </tr>
        <tr>
            <td class="column1"><label for="topmargin"><?php echo WFText::_('WF_FULLPAGE_TOP_MARGIN'); ?></label></td>
            <td><input id="topmargin" name="topmargin" type="text" value=""
                       onchange="FullPageDialog.changedStyleProp();" /></td>
            <td class="column1"><label for="bottommargin"><?php echo WFText::_('WF_FULLPAGE_BOTTOM_MARGIN'); ?></label></td>
            <td><input id="bottommargin" name="bottommargin" type="text" value=""
                       onchange="FullPageDialog.changedStyleProp();" /></td>
        </tr>
    </table>
</fieldset>

<fieldset><legend><?php echo WFText::_('WF_FULLPAGE_APPEARANCE_LINKPROPS'); ?></legend>

    <table border="0" cellpadding="4" cellspacing="0">
        <tr>
            <td class="column1"><label for="link_color"><?php echo WFText::_('WF_FULLPAGE_LINK_COLOR'); ?></label></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><input id="link_color" name="link_color" type="text" class="color" value=""
                                   size="9"
                                   onchange="updateColor('link_color_pick','link_color');FullPageDialog.changedStyleProp();" /></td>
                    </tr>
                </table>
            </td>

            <td class="column1"><label for="visited_color"><?php echo WFText::_('WF_FULLPAGE_VISITED_COLOR'); ?></label></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><input id="visited_color" name="visited_color" class="color" type="text"
                                   value="" size="9"
                                   onchange="updateColor('visited_color_pick','visited_color');FullPageDialog.changedStyleProp();" /></td>
                    </tr>
                </table>
            </td>
        </tr>

        <tr>
            <td class="column1"><label for="active_color"><?php echo WFText::_('WF_FULLPAGE_ACTIVE_COLOR'); ?></label></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><input id="active_color" name="active_color" class="color" type="text"
                                   value="" size="9"
                                   onchange="updateColor('active_color_pick','active_color');FullPageDialog.changedStyleProp();" /></td>
                    </tr>
                </table>
            </td>

            <td>&nbsp;</td>
            <td>&nbsp;</td>
        </tr>
    </table>
</fieldset>

<fieldset><legend><?php echo WFText::_('WF_FULLPAGE_APPEARANCE_STYLE'); ?></legend>

    <table border="0" cellpadding="4" cellspacing="0">
        <tr>
            <td class="column1"><label for="stylesheet"><?php echo WFText::_('WF_FULLPAGE_STYLESHEET'); ?></label></td>
            <td>
                <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td><input id="stylesheet" name="stylesheet" type="text" class="browser" data-filter="css" value="" /></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="column1"><label for="style"><?php echo WFText::_('WF_FULLPAGE_STYLE'); ?></label></td>
            <td><input id="style" name="style" type="text" value=""
                       onchange="FullPageDialog.changedStyle();" /></td>
        </tr>
    </table>
</fieldset>
