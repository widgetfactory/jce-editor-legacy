<?php

/**
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');
// Set flag that this is an extension parent
DEFINE('_WF_EXT', 1);

// Load class dependencies
wfimport('editor.libraries.classes.plugin');
wfimport('editor.libraries.classes.extensions.search');
wfimport('editor.libraries.classes.extensions.browser');
wfimport('editor.libraries.classes.extensions.popups');

// Link Plugin Controller
class WFLinkPlugin extends WFEditorPlugin {
    /*
     *  @var varchar
     */

    var $extensions = array();
    var $popups = array();
    var $tabs = array();

    /**
     * Constructor activating the default information of the class
     *
     * @access	protected
     */
    function __construct() {
        parent::__construct();

        $this->getBrowser('link');
        $this->getSearch('link');
    }

    /**
     * Returns a reference to a plugin object
     *
     * This method must be invoked as:
     * 		<pre>  $advlink =AdvLink::getInstance();</pre>
     *
     * @access	public
     * @return	JCE  The editor object.
     * @since	1.5
     */
    function &getInstance() {
        static $instance;

        if (!is_object($instance)) {
            $instance = new WFLinkPlugin();
        }
        return $instance;
    }

    function display() {
        parent::display();

        $document = WFDocument::getInstance();
        $settings = $this->getSettings();

        $document->addScriptDeclaration('LinkDialog.settings=' . json_encode($settings) . ';');

        $tabs = WFTabs::getInstance(array(
                    'base_path' => WF_EDITOR_PLUGIN
                ));

        // Add tabs
        $tabs->addTab('link', 1);
        $tabs->addTab('advanced', $this->getParam('tabs_advanced', 1));

        $browser = $this->getBrowser('link');
        $browser->display();

        $search = $this->getSearch('link');
        $search->display();

        // Load Popups instance
        $popups = WFPopupsExtension::getInstance(array(
            'text' => false
        ));

        $popups->display();

        // add link stylesheet
        $document->addStyleSheet(array('link'), 'plugins');
        // add link scripts last
        $document->addScript(array('link'), 'plugins');
    }

    function getBrowser($type = 'link') {

        static $browsers;

        if (!isset($browsers)) {
            $browsers = array();
        }

        if (empty($browsers[$type])) {
            $browsers[$type] = WFBrowserExtension::getInstance($type);
        }

        return $browsers[$type];
    }
    
    function getSearch($type = 'link') {
        static $search;

        if (!isset($search)) {
            $search = array();
        }

        if (empty($search[$type])) {
            $search[$type] = WFSearchExtension::getInstance($type);
        }

        return $search[$type];
    }

    function getSettings() {
        $profile = $this->getProfile();

        $settings = array(
            'file_browser' => $this->getParam('file_browser', 1) && in_array('browser', explode(',', $profile->plugins)),
            'attributes' => array(
                'target' => $this->getParam('attributes_target', 1),
                'anchor' => $this->getParam('attributes_anchor', 1)
            )
        );

        return parent::getSettings($settings);
    }

}