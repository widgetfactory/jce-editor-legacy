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
        <label for="href" class="hastip span3" title="<?php echo WFText::_('WF_LABEL_URL_DESC'); ?>"><?php echo WFText::_('WF_LABEL_URL'); ?></label>
        <div class="input-append span8">
            <input id="href" type="text" value="" class="required browser span8" />
            <button class="btn email" title="<?php echo WFText::_('WF_LABEL_EMAIL'); ?>"><i class="icon-envelop"></i></button>
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
            <button class="btn anchor" title="<?php echo WFText::_('WF_LABEL_ANCHOR'); ?>"><i class="icon-anchor"></i></button>
            <!-- Target Dropdown -->
            <div class="dropdown">
                <!-- Link or button to toggle dropdown -->
            </div>
        </div>
    </div>
    <div class="row-fluid">
        <label for="text" class="hastip span3" title="<?php echo WFText::_('WF_LINK_LINK_TEXT_DESC'); ?>"><?php echo WFText::_('WF_LINK_LINK_TEXT'); ?></label>
        <input id="text" type="text" value="" class="required span9" />
    </div>
    <div id="attributes-target" class="row-fluid">
        <label for="target" class="hastip span3" title="<?php echo WFText::_('WF_LABEL_TARGET_DESC'); ?>"><?php echo WFText::_('WF_LABEL_TARGET'); ?></label>
        <select id="target" class="span9">
            <option value=""><?php echo WFText::_('WF_OPTION_NOT_SET'); ?></option>
            <option value="_self"><?php echo WFText::_('WF_OPTION_TARGET_SELF'); ?></option>
            <option value="_blank"><?php echo WFText::_('WF_OPTION_TARGET_BLANK'); ?></option>
            <option value="_parent"><?php echo WFText::_('WF_OPTION_TARGET_PARENT'); ?></option>
            <option value="_top"><?php echo WFText::_('WF_OPTION_TARGET_TOP'); ?></option>
        </select>
    </div>
    <div class="row-fluid">
        <label for="title" class="hastip span3" title="<?php echo WFText::_('WF_LABEL_TITLE_DESC'); ?>"><?php echo WFText::_('WF_LABEL_TITLE'); ?></label>
        <input id="title" type="text" value=""  class="span9" size="150" />
    </div>
    <div class="row-fluid">
        <div id="link-options">
            <?php
            if ($this->plugin->getSearch('link')->isEnabled()) :
                echo $this->plugin->getSearch('link')->render();
            endif;
            ?>
            <?php echo $this->plugin->getLinks()->render(); ?>
        </div>
    </div>
</div>