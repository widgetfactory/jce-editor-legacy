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

class WFFileSystem extends WFExtension
{
    /**
     * Constructor activating the default information of the class
     *
     * @access  protected
     */
    function __construct($config = array())
    {
        parent::__construct();
        
        $this->setProperties(array_merge($config, array(
        	'local'	=> true,
			'upload' => array(
				'stream' 			=> false,
				'chunking'			=> false,
				'unique_filenames' 	=> false
			)
        )));
    }
    /**
     * Returns a reference to a plugin object
     *
     * This method must be invoked as:
     *    <pre>  $advlink =AdvLink::getInstance();</pre>
     *
     * @access  public
     * @return  JCE  The editor object.
     * @since 1.5
     */
    public static function getInstance($type = 'joomla', $config = array())
    {
        static $instance;
        
        if (!is_object($instance)) {
            $fs = parent::loadExtensions(array(
	            'types' => array(
	                'filesystem'
	            ),
	            'extension' => $type
	        ));
	        
	        $classname  = 'WF' . ucfirst($fs) . 'FileSystem';
	        
	        if (class_exists($classname)) {
            	$instance = new $classname($config);
	        } else {
	        	$instance = new WFFileSystem($config);
	        }
        }
        
        return $instance;
    }
    
    /**
	 * Get the base directory.
	 * @return string base dir
	 */
	function getBaseDir()
	{
		return WFUtility::makePath(JPATH_SITE, $this->getRootDir());
	}
	/**
	 * Get the full base url
	 * @return string base url
	 */
	function getBaseURL()
	{
		return WFUtility::makePath(JURI::root(true), 'images');
	}
    
    /**
     * Return the full user directory path. Create if required
     *
     * @param string  The base path
     * @access public
     * @return Full path to folder
     */
    function getRootDir()
    {
    	static $root;
    	
    	if (!$root) {
    		$user 		= JFactory::getUser();
			$wf 		= WFEditorPlugin::getInstance();
			$profile 	= $wf->getProfile();
	
			// Get base directory as shared parameter
			$root = $this->get('dir', 'images');		
			// Remove whitespace
			$root = trim($root);
			// Convert slashes / Strip double slashes
			$root = preg_replace('/[\\\\]+/', '/', $root);
			// Remove first leading slash
			$root = ltrim($root, '/');
			// Force default directory if base param starts with a variable or a . eg $id
			if (preg_match('/[\.\$]/', $root{0})) {
				$root = 'images';
			}	
			
			jimport('joomla.user.helper');
			// Joomla! 1.6+
			if (method_exists('JUserHelper', 'getUserGroups')) {
				$groups 	= JUserHelper::getUserGroups($user->id);
				$groups		= array_keys($groups);
				$usertype 	= array_shift($groups);												
			} else {
				$usertype 	= $user->usertype;
			}

			// Replace any path variables
			$pattern	= array('/\$id/', '/\$username/', '/\$usertype/', '/\$(group|profile)/', '/\$day/', '/\$month/', '/\$year/');
			$replace	= array($user->id, $user->username, $usertype, $profile->name, date('d'), date('m'), date('Y'));	
			$root 		= preg_replace($pattern, $replace, $root);

			// split into path parts to preserve /
			$parts = explode('/', $root);
			
			// clean path parts
			$parts = WFUtility::makeSafe($parts, $wf->getParam('editor.websafe_mode', 'utf-8'));

			//join path parts
			$root = implode('/', $parts);
    	}
    	
    	return $root;
    }
    
    function getFiles($path, $filter)
    {
    	return array();
    }
    
    function getFolders($path)
    {
    	return array();
    }
	
	function getSourceDir($path)
	{
		return $path;
	}	
	
	function isMatch($needle, $haystack)
	{
		return $needle == $haystack;
	}
	
	function pathinfo($path)
	{
		return pathinfo($path);
	}
    
    function delete($path)
    {
    	return true;
    }
    
    function createFolder($path, $new)
    {
    	return true;
    }
    
    function rename($src, $dest)
    {
    	return true;
    }
    
    function copy($src, $dest)
    {
    	return true;
    }
    
    function move($src, $dest)
    {
    	return true;
    }
    
    function getFolderDetails($path)
    {
    	return array(
			'properties' => array('modified' => '')
		);
    }
    
    function getFileDetails($path)
    {
    	$data = array(
			'properties' => array(
				'size' 		=> '',
				'modified' 	=> ''
			)
		);
		
		if (preg_match('#\.(jpg|jpeg|bmp|gif|tiff|png)#i', $path)) {
			$image = array(
				'properties' => array(
					'width' 	=> 0, 
					'height' 	=> 0, 
					'preview' 	=> ''
				)
			);
			
			return array_merge_recursive($data, $image);
		}
		
		return $data;
    }
    
    function getDimensions($path)
    {
    	return array(
			'width'		=>	'', 
			'height'	=>	''
		);
    }
    
    function upload($method, $src, $dir, $name, $chunks = 0, $chunk = 0)
    {
    	return true;
    }
    
    function exists($path)
    {
    	return true;
    }
    
    function read($path)
    {
    	return '';
    }
    
    function write($path, $content)
    {
    	return true;
    }
    
    function isLocal()
    {
    	return $this->get('local') === true;
    }
}

/**
 * Filesystem Error class
 */
final class WFFileSystemResult
{
    /*
     * @var Object type eg: file / folder
     */
	public $type 		= 'files';
    /*
     * @boolean	Result state
     */
    public $state 		= false;
    /*
     * @int	Error code
     */
    public $code 		= null;
    /*
     * @var Error message
     */
    public $message 	= null;
    /*
     * @var File / Folder path
     */
    public $path 		= null;
    
    function __construct(){}
}