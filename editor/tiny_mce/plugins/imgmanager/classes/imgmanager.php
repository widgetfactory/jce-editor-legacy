<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2012 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');

// Load class dependencies
wfimport('editor.libraries.classes.manager');

final class WFImageManagerPlugin extends WFMediaManager {

    var $_filetypes = 'images=jpg,jpeg,png,gif';

    /**
     * @access	protected
     */
    public function __construct() {
        parent::__construct();

        $browser = $this->getBrowser();
        $browser->addEvent('onUpload', array($this, 'onUpload'));
    }

    /**
     * Returns a reference to the Image Manager object
     *
     * This method must be invoked as:
     * 		<pre>  $imgmanager = WFImageManagerPlugin::getInstance();</pre>
     *
     * @access	public
     * @return	object WFImageManagerPlugin
     */
    public function &getInstance() {
        static $instance;

        if (!is_object($instance)) {
            $instance = new WFImageManagerPlugin();
        }
        return $instance;
    }

    /**
     * Display the plugin
     * @access public
     */
    public function display() {
        parent::display();

        $document = WFDocument::getInstance();

        // create new tabs instance
        $tabs = WFTabs::getInstance(array(
                    'base_path' => WF_EDITOR_PLUGIN
                ));

        // Add tabs
        $tabs->addTab('image');

        $tabs->addTab('rollover', $this->getParam('tabs_rollover', 1));
        $tabs->addTab('advanced', $this->getParam('tabs_advanced', 1));

        $document->addScript(array('imgmanager'), 'plugins');
        $document->addStyleSheet(array('imgmanager'), 'plugins');

        $document->addScriptDeclaration('ImageManagerDialog.settings=' . json_encode($this->getSettings()) . ';');
    }

    function onUpload($file) {
        $browser = $this->getBrowser();
        $filesystem = $browser->getFileSystem();

        $params = $this->getParams();

        if (JRequest::getWord('method') === 'dragdrop') {
            $result = array(
                'file' => str_replace(JPATH_SITE . '/', '', $file),
                'name' => basename($file)
            );

            if ($params->get('always_include_dimensions', 1)) {
                $dim = @getimagesize($file);

                if ($dim) {
                    $result['width']    = $dim[0];
                    $result['height']   = $dim[1];
                }
            }

            $defaults = $this->getDefaults();

            unset($defaults['always_include_dimensions']);

            $styles = array();

            foreach ($defaults as $k => $v) {
                switch ($k) {
                    case 'align':
                        // convert to float
                        if ($v == 'left' || $v == 'right') {
                            $k = 'float';
                        } else {
                            $k = 'vertical-align';
                        }

                        // check for value and exclude border state parameter
                        if ($v != '') {
                            $styles[str_replace('_', '-', $k)] = $v;
                        }
                        break;
                    case 'border_width':
                    case 'border_style':
                    case 'border_color':
                        // only if border state set
                        $v = $defaults['border'] ? $v : '';

                        // add px unit to border-width
                        if ($v && $k == 'border_width' && is_numeric($v)) {
                            $v .= 'px';
                        }

                        // check for value and exclude border state parameter
                        if ($v != '') {
                            $styles[str_replace('_', '-', $k)] = $v;
                        }

                        break;
                    case 'margin_left':
                    case 'margin_right':
                    case 'margin_top':
                    case 'margin_bottom':
                        // add px unit to border-width
                        if ($v && is_numeric($v)) {
                            $v .= 'px';
                        }

                        // check for value and exclude border state parameter
                        if ($v != '') {
                            $styles[str_replace('_', '-', $k)] = $v;
                        }
                        break;
                    case 'classes':
                    case 'title':
                    case 'id':
                    case 'direction':
                    case 'usemap':
                    case 'longdesc':
                    case 'style':
                    case 'alt':
                        if ($k == 'direction') {
                            $k = 'dir';
                        }
                        
                        if ($k == 'classes') {
                            $k = 'class';
                        }

                        if ($v != '') {
                            $result[$k] = $v;
                        }

                        break;
                }
            }

            if (!empty($styles)) {
                $result['styles'] = $styles;
            }

            return $result;
        }

        return $browser->getResult();
    }

    function getSettings() {
        $params = $this->getParams();

        $settings = array(
            'attributes' => array(
                'dimensions' => $params->get('imgmanager.attributes_dimensions', 1),
                'align' => $params->get('imgmanager.attributes_align', 1),
                'margin' => $params->get('imgmanager.attributes_margin', 1),
                'border' => $params->get('imgmanager.attributes_border', 1)
            ),
            'always_include_dimensions' => $params->get('imgmanager.always_include_dimensions', 1)
        );

        return parent::getSettings($settings);
    }

    /**
     * Get default parameters
     * @return string parameters
     */
    function getDefaults() {
        return parent::getDefaults(array());
    }

}

?>