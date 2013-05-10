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

$document = WFDocument::getInstance();
?>
<table>
    <tr>
        <td style="vertical-align:top;width:75%;">
            <fieldset>
                <legend>
                    <?php echo WFText::_('WF_LABEL_PROPERTIES'); ?>
                </legend>
                <table summary="iframe">
                    <tr>
                        <td>
                            <label for="src" class="hastip" title="<?php echo WFText::_('WF_LABEL_URL_DESC'); ?>">
                                <?php echo WFText::_('WF_LABEL_URL'); ?>
                            </label>
                        </td>
                        <td colspan="2">
                            <input type="text" id="src" value="" class="required browser" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="width" class="hastip" title="<?php echo WFText::_('WF_LABEL_DIMENSIONS_DESC'); ?>">
                                <?php echo WFText::_('WF_LABEL_DIMENSIONS'); ?>
                            </label>
                        </td>
                        <td colspan="2">
                            <input type="text" id="width" value="" onchange="IframeDialog.setDimensions('width', 'height');" class="required" />
                            <select id="width_unit" onchange="IframeDialog.setDimensionUnit('width', 'height');">
                                <option value="px">px</option>
                                <option value="%">%</option>
                            </select>
                            x
                            <input type="text" id="height" value="" onchange="IframeDialog.setDimensions('height', 'width');" class="required" />
                            <select id="height_unit" onchange="IframeDialog.setDimensionUnit('height', 'width');">
                                <option value="px">px</option>
                                <option value="%">%</option>
                            </select>
                            <input id="constrain" type="checkbox" class="checkbox" checked="checked" />
                            <label for="constrain">
                                <?php echo WFText::_('WF_LABEL_PROPORTIONAL'); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="margin" class="hastip" title="<?php echo WFText::_('WF_LABEL_MARGIN_DESC'); ?>">
                                <?php echo WFText::_('WF_LABEL_MARGIN'); ?>
                            </label>
                        </td>
                        <td colspan="2">
                            <label for="margin_top">
                                <?php echo WFText::_('WF_OPTION_TOP'); ?>
                            </label>
                            <input type="text" id="margin_top" value="" size="3" maxlength="3" onchange="IframeDialog.setMargins();" />
                            <label for="margin_right">
                                <?php echo WFText::_('WF_OPTION_RIGHT'); ?>
                            </label>
                            <input type="text" id="margin_right" value="" size="3" maxlength="3" onchange="IframeDialog.setMargins();" />
                            <label for="margin_bottom">
                                <?php echo WFText::_('WF_OPTION_BOTTOM'); ?>
                            </label>
                            <input type="text" id="margin_bottom" value="" size="3" maxlength="3" onchange="IframeDialog.setMargins();" />
                            <label for="margin_left">
                                <?php echo WFText::_('WF_OPTION_LEFT'); ?>
                            </label>
                            <input type="text" id="margin_left" value="" size="3" maxlength="3" onchange="IframeDialog.setMargins();" />
                            <input type="checkbox" class="checkbox" id="margin_check" onclick="IframeDialog.setMargins();">
                            <label>
                                <?php echo WFText::_('WF_LABEL_EQUAL'); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="align" class="hastip" title="<?php echo WFText::_('WF_LABEL_ALIGN_DESC'); ?>">
                                <?php echo WFText::_('WF_LABEL_ALIGN'); ?>
                            </label>
                        </td>
                        <td>
                            <select id="align" onchange="IframeDialog.updateStyles();">
                                <option value="">
                                    <?php echo WFText::_('WF_OPTION_NOT_SET'); ?>
                                </option>
                                <option value="left">
                                    <?php echo WFText::_('WF_OPTION_ALIGN_LEFT'); ?>
                                </option>
                                <option value="right">
                                    <?php echo WFText::_('WF_OPTION_ALIGN_RIGHT'); ?>
                                </option>
                                <option value="top">
                                    <?php echo WFText::_('WF_OPTION_ALIGN_TOP'); ?>
                                </option>
                                <option value="middle">
                                    <?php echo WFText::_('WF_OPTION_ALIGN_MIDDLE'); ?>
                                </option>
                                <option value="bottom">
                                    <?php echo WFText::_('WF_OPTION_ALIGN_BOTTOM'); ?>
                                </option>
                            </select>
                        </td>
                        <td>
                            <label for="scrolling" class="hastip" title="<?php echo JText::_('WF_IFRAME_SCROLLING_DESC'); ?>">
                                <?php echo JText::_('WF_IFRAME_SCROLLING'); ?>
                            </label>
                            <select id="scrolling">
                                <option value="yes">
                                    <?php echo JText::_('WF_OPTION_YES'); ?>
                                </option>
                                <option value="no">
                                    <?php echo JText::_('WF_OPTION_NO'); ?>
                                </option>
                                <option value="auto">
                                    <?php echo JText::_('WF_OPTION_AUTO'); ?>
                                </option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td nowrap="nowrap">
                            <label for="marginwidth" class="hastip" title="<?php echo JText::_('WF_IFRAME_MARGINWIDTH_DESC'); ?>">
                                <?php echo JText::_('WF_IFRAME_MARGINWIDTH'); ?>
                            </label>
                        </td>
                        <td nowrap="nowrap">
                            <input id="marginwidth" type="text"  value="" style="width: 50px" />
                        </td>
                        <td nowrap="nowrap">
                            <label for="marginheight" class="hastip" title="<?php echo JText::_('WF_IFRAME_MARGINHEIGHT_DESC'); ?>">
                                <?php echo JText::_('WF_IFRAME_MARGINHEIGHT'); ?>
                            </label>

                            <input id="marginheight" type="text"  value="" style="width: 50px" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label for="frameborder" class="hastip" title="<?php echo JText::_('WF_IFRAME_FRAMEBORDER_DESC'); ?>">
                                <?php echo JText::_('WF_IFRAME_FRAMEBORDER'); ?>
                            </label>
                        </td>
                        <td colspan="2">
                            <select id="frameborder">
                                <option value="1">
                                    <?php echo JText::_('WF_OPTION_YES'); ?>
                                </option>
                                <option value="0">
                                    <?php echo JText::_('WF_OPTION_NO'); ?>
                                </option>
                            </select>
                        </td>
                    </tr>
                </table>
            </fieldset>
        </td>
        <td style="vertical-align:top;">
            <fieldset>
                <legend>
                    <?php echo WFText::_('WF_LABEL_PREVIEW'); ?>
                </legend>
                <table summary="preview">
                    <tr>
                        <td style="vertical-align:top;">
                            <div class="preview">
                                <img id="sample" src="<?php echo $document->image('sample.jpg', 'libraries'); ?>" alt="sample.jpg" />
                                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
                            </div>
                        </td>
                    </tr>
                </table>
            </fieldset>
        </td>
    </tr>
</table>
