<?php
/**
 * @version   $Id: filesystem.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
// no direct access
defined('_JEXEC') or die('ERROR_403');

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
    function &getInstance($type = 'joomla', $config = array())
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
				$usertype 	= array_shift(array_keys($groups));												
			} else {
				$usertype 	= $user->usertype;
			}

			// Replace any path variables
			$pattern	= array('/\$id/', '/\$username/', '/\$usertype/', '/\$(group|profile)/', '/\$day/', '/\$month/', '/\$year/');
			$replace	= array($user->id, strtolower($user->username), strtolower($usertype), strtolower($profile->name), date('d'), date('m'), date('Y'));	
			$root 		= preg_replace($pattern, $replace, $root);
				
			// Clean
			$root = preg_replace(array('/$\w+\b/', '/(\.) {2,}/', '/[^A-Za-z0-9:\.\_\-\/]/'), '', $root);
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
class WFFileSystemResult
{
    /*
     * @var Object type eg: file / folder
     */
	var $type 		= 'files';
    /*
     * @boolean	Result state
     */
    var $state 		= false;
    /*
     * @int	Error code
     */
    var $code 		= null;
    /*
     * @var Error message
     */
    var $message 	= null;
    /*
     * @var File / Folder path
     */
    var $path = null;
    
    function __construct(){}
}