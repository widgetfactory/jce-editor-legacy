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
// set as an extension parent
define('_WF_EXT', 1);

// Load class dependencies
wfimport('editor.libraries.classes.plugin');
wfimport('editor.libraries.classes.extensions');
wfimport('editor.libraries.classes.extensions.aggregator');

class WFIframePlugin extends WFEditorPlugin {
    public function display() {
        parent::display();

        $document = WFDocument::getInstance();

        // create new tabs instance
        $tabs = WFTabs::getInstance(array(
                    'base_path' => WF_EDITOR_PLUGIN
                ));
        
        $document->addScript(array('iframe'), 'plugins');
        $document->addStyleSheet(array('iframe'), 'plugins');

        $document->addScriptDeclaration('IframeDialog.settings=' . json_encode($this->getSettings()) . ';');

        // Add tabs
        $tabs->addTab('file');
        $tabs->addTab('advanced', $this->getParam('tabs_advanced', 1));

        // Load video aggregators (Youtube, Vimeo etc)
        $video = new WFAggregatorExtension(array('format' => 'video', 'embed' => 'false'));
        $video->display();
        
        $maps = new WFAggregatorExtension(array('format' => 'maps'));
        $maps->display();
        
        if ($video || $maps) {
            $tabs->addTab('options', $this->getParam('tabs_options', 1), array('plugin' => $this));
        }
    }
    
    public function getAggregatorTemplate() {
        $tpl = '';

        $extension = WFAggregatorExtension::getInstance();

        foreach ($extension->getAggregators() as $aggregator) {
            $tpl .= '<fieldset class="aggregator_option ' . $aggregator->getName() . '" id="' . $aggregator->getName() . '_options" style="display:none;"><legend>' . WFText::_($aggregator->getTitle()) . '</legend>';
            $tpl .= $extension->loadTemplate($aggregator->getName());
            $tpl .= '</fieldset>';
        }

        return $tpl;
    }

    public function getSettings() {
        $profile = $this->getProfile();

        $settings = array(
            'defaults' => $this->getDefaults(),
            'file_browser' => $this->getParam('file_browser', 1) && in_array('browser', explode(',', $profile->plugins))
        );

        return parent::getSettings($settings);
    }

}