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
        <div class="span7">
            <div>
                <label for="href" class="hastip" title="<?php echo WFText::_('WF_LABEL_URL_DESC'); ?>"><?php echo WFText::_('WF_LABEL_URL'); ?></label>
                <div class="input-append">
                    <input id="href" type="text" value="" size="150" class="required browser" />
                    <button class="btn email" title="<?php echo WFText::_('WF_LABEL_EMAIL'); ?>"><i class="icon-envelope"></i></button>
                    <!-- Email dropdown -->
                    <div class="dropdown">
                        <!-- Link or button to toggle dropdown -->
                        <ul class="dropdown-menu" role="menu">
                            <li>
                                <label for="email_to"><?php echo WFText::_('WF_LABEL_TO'); ?></label>
                                <textarea id="email_mailto" class="email"></textarea>
                            </li>
                            <li>
                                <label for="email_cc"><?php echo WFText::_('WF_LABEL_CC'); ?></label>
                                <textarea id="email_cc" class="email"></textarea>
                            </li>
                            <li>
                                <label for="email_bcc"><?php echo WFText::_('WF_LABEL_BCC'); ?></label>
                                <textarea id="email_bcc" class="email"></textarea>
                            </li>
                            <li>
                                <label for="email_subject"><?php echo WFText::_('WF_LABEL_SUBJECT'); ?></label>
                                <textarea id="email_subject" class="email"></textarea>
                            </li>
                            <li>
                                <button class="btn ok"><i class="icon-ok"></i>&nbsp;<?php echo WFText::_('WF_LABEL_OK'); ?></button>
                                <button class="btn cancel"><i class="icon-remove"></i>&nbsp;<?php echo WFText::_('WF_LABEL_CANCEL'); ?></button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div>
                <label for="text" class="hastip" title="<?php echo WFText::_('WF_LINK_LINK_TEXT_DESC'); ?>"><?php echo WFText::_('WF_LINK_LINK_TEXT'); ?></label>
                <input id="text" type="text" value="" class="required" />
            </div>
        </div>
        <div>
            <div class="row-fluid">
                <div class="span7">
                    <div id="link-options">
                        <?php
                        if ($this->plugin->getSearch('link')->isEnabled()) :
                            echo $this->plugin->getSearch('link')->render();
                        endif;
                        ?>
                        <?php echo $this->plugin->getLinks()->render(); ?>
                    </div>
                    <h4><?php echo WFText::_('WF_LABEL_ATTRIBUTES'); ?></h4>
                    <div id="attributes-anchor">
                        <label for="anchor" class="hastip" title="<?php echo WFText::_('WF_LABEL_ANCHORS_DESC'); ?>"><?php echo WFText::_('WF_LABEL_ANCHORS'); ?></label>
                        <span id="anchor_container">&nbsp;</span>
                    </div>
                    <div id="attributes-target">
                        <td><label for="target" class="hastip" title="<?php echo WFText::_('WF_LABEL_TARGET_DESC'); ?>"><?php echo WFText::_('WF_LABEL_TARGET'); ?></label></td>
                        <td><select id="target">
                                <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
                                <option value="_self"><?php echo WFText::_('WF_OPTION_TARGET_SELF'); ?></option>
                                <option value="_blank"><?php echo WFText::_('WF_OPTION_TARGET_BLANK'); ?></option>
                                <option value="_parent"><?php echo WFText::_('WF_OPTION_TARGET_PARENT'); ?></option>
                                <option value="_top"><?php echo WFText::_('WF_OPTION_TARGET_TOP'); ?></option>
                            </select></td>
                    </div>
                    <div>
                        <label for="title" class="hastip" title="<?php echo WFText::_('WF_LABEL_TITLE_DESC'); ?>"><?php echo WFText::_('WF_LABEL_TITLE'); ?></label>
                        <input id="title" type="text" value="" size="150" /></div>
                </div>
            </div>
        </div>
    </div>
</div>