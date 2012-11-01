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

//wfimport('editor.libraries.classes.error');
wfimport('editor.libraries.classes.utility');
wfimport('editor.libraries.classes.token');
wfimport('editor.libraries.classes.document');
wfimport('editor.libraries.classes.view');
wfimport('editor.libraries.classes.tabs');
wfimport('editor.libraries.classes.request');

// define use of INI lang
define('WF_INI_LANG', 1);

/**
 * JCE class
 *
 * @static
 * @package		JCE
 * @since	1.5
 */
class WFEditor extends JObject {

    /**
     * @var varchar
     */
    private $_version = '@@version@@';

    /**
     * Constructor activating the default information of the class
     *
     * @access	protected
     */
    public function __construct($config = array()) {
        $this->setProperties($config);
    }

    /**
     * Returns a reference to a editor object
     *
     * This method must be invoked as:
     * 		<pre>  $browser =JContentEditor::getInstance();</pre>
     *
     * @access	public
     * @return	JCE  The editor object.
     */
    public function & getInstance($config = array()) {
        static $instance;

        if (!is_object($instance)) {
            $instance = new WFEditor($config);
        }
        return $instance;
    }

    /**
     * Get the current version
     * @access protected
     * @return string
     */
    protected function getVersion() {
        return $this->get('_version');
    }

    /**
     * Get the Super Administrator status
     *
     * Determine whether the user is a Super Administrator
     * @access protected
     * @return boolean
     */
    protected function isSuperAdmin() {
        $user = JFactory::getUser();

        if (WF_JOOMLA15) {
            return (strtolower($user->usertype) == 'superadministrator' || strtolower($user->usertype) == 'super administrator' || $user->gid == 25) ? true : false;
        }
        return false;
    }

    /**
     * Get an appropriate editor profile
     * @access public
     * @return $profile Object
     */
    public function getProfile() {
        static $profile;

        if (!is_object($profile)) {
            $mainframe = JFactory::getApplication();

            $db = JFactory::getDBO();
            $user = JFactory::getUser();
            $option = $this->getComponentOption();

            $query = $db->getQuery(true);

            if (is_object($query)) {
                $query->select('*')->from('#__wf_profiles')->where('published = 1')->order('ordering ASC');
            } else {
                $query = 'SELECT * FROM #__wf_profiles'
                        . ' WHERE published = 1'
                        . ' ORDER BY ordering ASC';
            }

            $db->setQuery($query);
            $profiles = $db->loadObjectList();

            if ($option == 'com_jce') {
                $component_id = JRequest::getInt('component_id');

                if ($component_id) {
                    $component = WFExtensionHelper::getComponent($component_id);
                    $option = isset($component->element) ? $component->element : $component->option;
                }
            }
            // get the Joomla! area (admin or site)
            $area = $mainframe->isAdmin() ? 2 : 1;

            // load mobile detect class
            include_once(dirname(__FILE__) . '/mobile.php');
            $mobile = new Mobile_Detect();

            // set device values
            if ($mobile->isMobile()) {
                $device = 'phone';
            } else if ($mobile->isTablet()) {
                $device = 'tablet';
            } else {
                $device = 'desktop';
            }

            foreach ($profiles as $item) {
                // check if option is in list
                $isComponent = in_array($option, explode(',', $item->components));

                // Set area default as 'site,admin'
                if (!isset($item->area) || empty($item->area)) {
                    $item->area = 0;
                }
                // set device default as 'desktop,tablet,mobile'
                if (!isset($item->device) || empty($item->device)) {
                    $item->device = 'desktop,tablet,phone';
                }

                if (in_array($area, explode(',', $item->area))) {
                    if (in_array($device, explode(',', $item->device))) {
                        // Check user
                        if ($user->id && in_array($user->id, explode(',', $item->users))) {
                            if ($item->components) {
                                if ($isComponent) {
                                    $profile = $item;
                                    return $profile;
                                }
                            } else {
                                $profile = $item;
                                return $profile;
                            }
                        }

                        // Joomla! 1.6+
                        if (method_exists('JUser', 'getAuthorisedGroups')) {
                            $keys = $user->getAuthorisedGroups();
                        } else {
                            $keys = array($user->gid);
                        }

                        if ($item->types) {
                            $groups = array_intersect($keys, explode(',', $item->types));

                            if (!empty($groups)) {
                                // Check components
                                if ($item->components) {
                                    if ($isComponent) {
                                        $profile = $item;
                                        return $profile;
                                    }
                                } else {
                                    $profile = $item;
                                    return $profile;
                                }
                            }
                        }

                        // Check components only
                        if ($item->components && $isComponent) {
                            $profile = $item;
                            return $profile;
                        }
                    }
                }
            }

            return null;
        }

        return $profile;
    }

    /**
     * Get the component option
     * @access private
     * @return string
     */
    private function getComponentOption() {
        $option = JRequest::getCmd('option', '');

        switch ($option) {
            case 'com_section' :
                $option = 'com_content';
                break;
            case 'com_categories' :
                $section = JRequest::getVar('section');
                if ($section) {
                    $option = $section;
                }
                break;
        }

        return $option;
    }

    /**
     * Get editor parameters
     * @access  public
     * @param 	array $options
     * @return 	object
     */
    public function getParams($options = array()) {
        static $params;

        if (!isset($params)) {
            $params = array();
        }

        // set blank key if not set
        if (!isset($options['key'])) {
            $options['key'] = '';
        }
        // set blank path if not set
        if (!isset($options['path'])) {
            $options['path'] = '';
        }

        $signature = serialize($options);

        if (empty($params[$signature])) {
            wfimport('admin.helpers.extension');
            // get component
            $component = WFExtensionHelper::getComponent();
            // get params data for this profile
            $profile = $this->getProfile();

            $profile_params = array();
            $component_params = array();

            if (!empty($component->params)) {
                $component_params = json_decode($component->params, true);
                // set null as array
                if (!$component_params) {
                    $component_params = array();
                }
            }

            if ($profile) {
                $profile_params = json_decode($profile->params, true);
                // set null as array
                if (!$profile_params) {
                    $profile_params = array();
                }
            }

            // merge data and convert to json string
            $data = WFParameter::mergeParams($component_params, $profile_params);

            $params[$signature] = new WFParameter($data, $options['path'], $options['key']);
        }

        return $params[$signature];
    }

    /**
     * Remove linebreaks and carriage returns from a parameter value
     *
     * @return The modified value
     * @param string	The parameter value
     */
    protected function cleanParam($param) {
        if (is_array($param)) {
            $param = implode('|', $param);
        }
        return trim(preg_replace('/\n|\r|\t(\r\n)[\s]+/', '', $param));
    }

    /**
     * Get a parameter by key
     * @param $key Parameter key eg: editor.width
     * @param $fallback Fallback value
     * @param $default Default value
     */
    public function getParam($key, $fallback = '', $default = '', $type = 'string', $allowempty = true) {
        // get all keys
        $keys = explode('.', $key);

        // remove base key eg: 'editor'
        $base = array_shift($keys);

        // get params for base key
        $params = self::getParams(array('key' => $base));
        // get a parameter

        $param = $params->get($keys, $fallback, $allowempty);

        if (is_string($param) && $type == 'string') {
            $param = self::cleanParam($param);
        }

        if (is_numeric($default)) {
            $default = (float) $default;
        }

        if (is_numeric($param)) {
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

    protected function checkLanguage($tag) {
        $file = JPATH_SITE . '/language/' . $tag . '/' . $tag . '.com_jce.xml';

        if (file_exists($file)) {
            wfimport('admin.classes.xml');

            $xml = WFXMLElement::load($file);

            if ($xml) {
                $version = (string) $xml->attributes()->version;

                if ($version == '2.0') {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Load a language file
     *
     * @param string $prefix Language prefix
     * @param object $path[optional] Base path
     */
    protected function loadLanguage($prefix, $path = JPATH_SITE) {
        $language = JFactory::getLanguage();
        $tag = $this->getLanguageTag();

        $language->load($prefix, $path, $tag, true);
    }

    /**
     * Return the curernt language code
     *
     * @access public
     * @return language code
     */
    public function getLanguageDir() {
        $language = JFactory::getLanguage();
        $tag = $this->getLanguageTag();

        if ($language->getTag() == $tag) {
            return $language->isRTL() ? 'rtl' : 'ltr';
        }

        return 'ltr';
    }

    /**
     * Return the curernt language code
     *
     * @access public
     * @return language code
     */
    protected function getLanguageTag() {
        $language = JFactory::getLanguage();
        $tag = $language->getTag();

        static $_language;

        if (!isset($_lanugage)) {
            if ($this->checkLanguage($tag)) {
                $_language = $tag;
            } else {
                $_language = 'en-GB';
            }
        }

        return $_language;
    }

    /**
     * Return the curernt language code
     *
     * @access public
     * @return language code
     */
    public function getLanguage() {
        $tag = $this->getLanguageTag();

        return substr($tag, 0, strpos($tag, '-'));
    }

    /**
     * Named wrapper to check access to a feature
     *
     * @access 			public
     * @return 			string
     */
    public function checkUser() {
        return $this->getProfile();
    }

    /**
     * XML encode a string.
     *
     * @access	public
     * @param 	string	String to encode
     * @return 	string	Encoded string
     */
    public function xmlEncode($string) {
        return preg_replace(array('/&/', '/</', '/>/', '/\'/', '/"/'), array('&amp;', '&lt;', '&gt;', '&apos;', '&quot;'), $string);
    }

    /**
     * XML decode a string.
     *
     * @access	public
     * @param 	string	String to decode
     * @return 	string	Decoded string
     */
    public function xmlDecode($string) {
        return preg_replace(array('&amp;', '&lt;', '&gt;', '&apos;', '&quot;'), array('/&/', '/</', '/>/', '/\'/', '/"/'), $string);
    }

    protected function log($file, $msg) {
        jimport('joomla.error.log');
        $log = JLog::getInstance($file);
        $log->addEntry(array('comment' => 'LOG: ' . $msg));
    }

}

?>