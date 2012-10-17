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

wfimport('editor.libraries.classes.editor');

if (!defined('WF_INI_LANG')) {
    define('WF_INI_LANG', 0);
}

/**
 * JCE class
 *
 * @package	JCE Site
 */
class WFEditorPlugin extends WFEditor {

    private $_alerts = array();

    /**
     * Constructor activating the default information of the class
     *
     * @access	public
     */
    function __construct($config = array()) {
        // Call parent
        parent::__construct();

        $db = JFactory::getDBO();

        // get plugin name
        $plugin = JRequest::getCmd('plugin');

        // check plugin
        if ($this->checkPlugin($plugin)) {
            $this->set('name', $plugin);

            if (!array_key_exists('type', $config)) {
                $config['type'] = 'standard';
            }

            if (!array_key_exists('base_path', $config)) {
                $config['base_path'] = WF_EDITOR_PLUGINS . '/' . $plugin;
            }

            if (!defined('WF_EDITOR_PLUGIN')) {
                define('WF_EDITOR_PLUGIN', $config['base_path']);
            }

            if (!array_key_exists('view_path', $config)) {
                $config['view_path'] = WF_EDITOR_PLUGINS . '/' . $plugin;
            }

            if (!array_key_exists('layout', $config)) {
                $config['layout'] = 'default';
            }

            if (!array_key_exists('template_path', $config)) {
                $config['template_path'] = WF_EDITOR_PLUGIN . '/tmpl';
            }

            $this->setProperties($config);
        } else {
            die(JError::raiseError(403, 'RESTRICTED ACCESS'));
        }
    }

    /**
     * Returns a reference to a editor object
     *
     * This method must be invoked as:
     * 		<pre>  $browser =JCE::getInstance();</pre>
     *
     * @access	public
     * @return	JCE  The editor object.
     * @since	1.5
     */
    public function & getInstance($config = array()) {
        static $instance;

        if (!is_object($instance)) {
            $instance = new WFEditorPlugin($config);
        }

        return $instance;
    }

    /**
     * Get plugin View
     * @access public
     * @return WFView
     */
    public function & getView() {
        static $view;

        if (!is_object($view)) {
            // create plugin view
            $view = new WFView(array(
                        'view_path' => $this->get('base_path'),
                        'template_path' => $this->get('template_path'),
                        'name' => $this->get('name'),
                        'layout' => $this->get('layout')
                    ));

            $view->assign('plugin', $this);
        }

        return $view;
    }

    private function isRequest() {
        $format = JRequest::getWord('format');
        return ($format == 'json' || $format == 'raw') && (JRequest::getVar('json') || JRequest::getWord('action'));
    }

    public function execute() {
        WFToken::checkToken() or die('RESTRICTED ACCESS');

        // JSON request or upload action
        if ($this->isRequest()) {
            $request = WFRequest::getInstance();
            $request->process();
        } else {
            $version = $this->getVersion();
            $name = $this->getName();

            // process javascript languages
            if (JRequest::getWord('task') == 'loadlanguages') {
                jimport('joomla.application.component.model');

                JModel::addIncludePath(JPATH_COMPONENT_ADMINISTRATOR . '/models');
                $model = JModel::getInstance('editor', 'WFModel');

                $files = array();
                $section = array('dlg', $name . '_dlg');
                $ini = JPATH_SITE . '/language/en-GB/en-GB.com_jce_' . $name . '.ini';

                if (is_file($ini)) {
                    $files[] = $ini;

                    $language = JFactory::getLanguage();
                    $tag = $language->getTag();

                    // non-english language
                    if ($tag != 'en-GB') {
                        $ini = JPATH_SITE . '/language/' . $tag . '/' . $tag . '.com_jce_' . $name . '.ini';

                        if (is_file($ini)) {
                            $files[] = $ini;
                        }
                    }
                }

                if (method_exists($model, 'loadLanguages')) {
                    $model->loadLanguages($files, $section);
                }
            }

            $this->loadLanguage('com_jce', JPATH_ADMINISTRATOR);
            // Load Plugin language
            $this->loadPluginLanguage();

            $xml = WFXMLHelper::parseInstallManifest(WF_EDITOR_PLUGIN . '/' . $name . '.xml');

            if (isset($xml['version'])) {
                $version = $xml['version'];
            }

            // create the document
            $document = WFDocument::getInstance(array(
                        'version' => $version,
                        'title' => WFText::_('WF_' . strtoupper($this->getName() . '_TITLE')),
                        'name' => $name,
                        'language' => $this->getLanguageTag(),
                        'direction' => $this->getLanguageDir(),
                        'compress_javascript' => $this->getParam('editor.compress_javascript', 0),
                        'compress_css' => $this->getParam('editor.compress_css', 0)
                    ));

            // set standalone mode
            $document->set('standalone', JRequest::getInt('standalone', 0));

            // create display
            $this->display();

            $document = WFDocument::getInstance();

            // set standalone mode (for File Browser etc)
            if ($document->get('standalone') == 1) {
                // remove some scripts
                $document->removeScript('tiny_mce_popup', 'tiny_mce');
                $document->removeScript('tiny_mce_utils', 'libraries');
            }
            
            // load plugin dialog language file if necessary
            if ($this->getParam('editor.compress_javascript', 0)) {
                $file = "/langs/" . $this->getLanguage() . "_dlg.js";

                if (!JFile::exists(WF_EDITOR_PLUGIN . $file)) {
                    $file = "/langs/en_dlg.js";
                }

                if (JFile::exists(WF_EDITOR_PLUGIN . $file)) {
                    $document->addScript(array('plugins/' . $this->getName() . $file), 'tiny_mce');
                }
            }

            // pack assets if required
            $document->pack(true, $this->getParam('editor.compress_gzip', 0));

            // get the view
            $view = $this->getView();

            // set body output
            $document->setBody($view->loadTemplate());

            // render document		
            $document->render();
        }
    }

    /**
     * Display plugin
     * @access private
     */
    public function display() {
        jimport('joomla.filesystem.folder');
        $document = WFDocument::getInstance();

        $document->addScript(array('tiny_mce_popup'), 'tiny_mce');

        if (WF_INI_LANG) {
            // ini language
            $document->addScript(array('index.php?option=com_jce&view=editor&' . $document->getQueryString(array('task' => 'loadlanguages'))), 'joomla');
        }

        // jquery versions
        $jquery = array('jquery/jquery-' . WF_JQUERY . '.min.js', 'jquery/jquery-ui-' . WF_JQUERYUI . '.custom.min.js');

        $document->addScript($jquery, 'libraries');

        $document->addScript(array(
            'html5',
            'select',
            'tips',
            'tiny_mce_utils',
            'plugin'
                ), 'libraries');

        // get UI Theme
        $theme = $this->getParam('editor.dialog_theme', 'jce');

        $ui = JFolder::files(WF_EDITOR_LIBRARIES . '/css/jquery/' . $theme, '\.css$');

        $document->addStyleSheet(array(
            'jquery/' . $theme . '/' . basename($ui[0], '.css'),
            'plugin'
                ), 'libraries');

        // add custom plugin.css if exists
        if (is_file(JPATH_SITE . '/media/jce/css/plugin.css')) {
            $document->addStyleSheet(array('media/jce/css/plugin.css'), 'joomla');
        }
    }

    /**
     * Return the plugin name
     * @access public
     * @return string
     */
    public function getName() {
        return $this->get('name');
    }

    /**
     * Get default values for a plugin.
     * Key / Value pairs will be retrieved from the profile or plugin manifest
     * @access 	public
     * @param 	array $defaults
     * @return 	array
     */
    public function getDefaults($defaults = array()) {
        $name = $this->getName();

        $params = $this->getParams(array(
            'key' => $name,
            'path' => WF_EDITOR_PLUGIN . '/' . $name . '.xml'
        ));

        $defaults = array_merge($defaults, (array) $params->getAll('defaults'));
        
        // map direction to dir
        if (array_key_exists('direction', $defaults)) {
            $defaults['dir'] = $defaults['direction'];
            unset($defaults['direction']);
        }

        return $defaults;
    }

    /**
     * Check the user is in an authorized group
     * Check the users group is authorized to use the plugin
     *
     * @access 			public
     * @return 			boolean
     */
    public function checkPlugin($plugin = null) {
        if ($plugin) {
            // check existence of plugin directory
            if (is_dir(WF_EDITOR_PLUGINS . '/' . $plugin) || is_dir(JPATH_PLUGINS . '/jce/' . $plugin)) {
                // check profile	
                $profile = $this->getProfile();
                return is_object($profile) && isset($profile->id) && $profile->published = 1 && in_array($plugin, explode(',', $profile->plugins));
            }
        }

        return false;
    }

    /**
     * Load current plugin language file
     * @access private
     */
    private function loadPluginLanguage() {
        $this->loadLanguage('com_jce_' . trim($this->getName()));
    }

    /**
     * Add an alert array to the stack
     * 
     * @access private
     * @param object $class Alert classname
     * @param object $title Alert title
     * @param object $text 	Alert text
     */
    protected function addAlert($class = 'info', $title = '', $text = '') {
        $alerts = $this->getAlerts();

        $alerts[] = array(
            'class' => $class,
            'title' => $title,
            'text' => $text
        );

        $this->set('_alerts', $alerts);
    }

    /**
     * Get current alerts
     * @access private
     * @return array Alerts
     */
    private function getAlerts() {
        return $this->get('_alerts');
    }

    /**
     * Convert a url to path
     *
     * @access	public
     * @param	string 	The url to convert
     * @return	string 	Full path to file
     */
    public function urlToPath($url) {
        $document = WFDocument::getInstance();
        return $document->urlToPath($url);
    }

    /**
     * Returns an image url
     *
     * @access	public
     * @param	string 	The file to load including path and extension eg: libaries.image.gif
     * @return	string 	Image url
     */
    public function image($image, $root = 'libraries') {
        $document = WFDocument::getInstance();

        return $document->image($image, $root);
    }

    /**
     * Load a plugin extension
     *
     * @access	protected
     */
    protected function getExtensions($arguments) {
        return array();
    }

    /**
     * Load & Call an extension
     *
     * @access	protected
     * @param 	array $config
     * @return 	array
     */
    protected function loadExtensions($config = array()) {
        return array();
    }

    /**
     * Compile plugin settings from defaults and alerts
     * 
     * @access  public
     * @param 	array $settings
     * @return 	array
     */
    public function getSettings($settings = array()) {
        $default = array(
            'alerts' => $this->getAlerts(),
            'defaults' => $this->getDefaults()
        );

        $settings = array_merge($default, $settings);

        return $settings;
    }

    /**
     * Get a parameter by key
     * 
     * @access 	public
     * @param 	string $key Parameter key eg: editor.width
     * @param 	mixed $fallback Fallback value
     * @param 	mixed $default Default value
     * @param 	string $type Variable type eg: string, boolean, integer, array
     * @param 	bool $allowempty
     * @return 	mixed
     */
    public function getParam($key, $fallback = '', $default = '', $type = 'string', $allowempty = true) {
        // get plugin name
        $name = $this->getName();
        // get all keys
        $keys = explode('.', $key);

        // root key set
        if ($keys[0] === 'editor' || $keys[0] === $name) {
            return parent::getParam($key, $fallback, $default, $type, $allowempty);
            // no root key set, treat as shared param
        } else {
            // get all params
            $params = parent::getParams();
            // check plugin param and fallback to editor param
            $param = $params->get($name . '.' . $key, $params->get('editor.' . $key, $fallback, $allowempty), $allowempty);

            if (is_string($param) && $type === 'string') {
                $param = self::cleanParam($param);
            }

            if (is_numeric($default) && $type === 'integer') {
                $default = (float) $default;
            }

            if (is_numeric($param) && $type === 'integer') {
                $param = (float) $param;
            }

            if ($param === $default) {
                return '';
            }

            if ($type == 'boolean') {
                $param = (bool) $param;
            }

            return $param;
        }
    }

    /**
     * Named wrapper to check access to a feature
     *
     * @access 			public
     * @param string	The feature to check, eg: upload
     * @param mixed		The defalt value
     * @return 			Boolean
     */
    public function checkAccess($option, $default = 0) {
        return (bool) self::getParam($option, $default);
    }

}

?>