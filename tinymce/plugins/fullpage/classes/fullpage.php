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

require_once( WF_EDITOR_LIBRARIES . '/classes/plugin.php' );

class WFFullpagePlugin extends WFEditorPlugin {

    /**
     * Constructor activating the default information of the class
     *
     * @access	protected
     */
    function __construct() {
        parent::__construct(array('colorpicker' => true));
    }

    function display() {
        parent::display();

        $document = WFDocument::getInstance();

        $document->addScript(array('fullpage'), 'plugins');
        $document->addStyleSheet(array('fullpage'), 'plugins');

        $tabs = WFTabs::getInstance(array(
            'base_path' => WF_EDITOR_PLUGIN
        ));

        $tabs->addTab('meta');
        $tabs->addTab('appearance');
    }

    function getSettings() {
        $settings = array();

        return json_encode($settings);
    }

}