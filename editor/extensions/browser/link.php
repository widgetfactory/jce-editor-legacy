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

wfimport('editor.libraries.classes.extensions.browser');

class WFLinkBrowser extends WFBrowserExtension 
{
	/*
	*  @var varchar
	*/
	private $extensions = array();
	/**
	* Constructor activating the default information of the class
	*
	* @access	protected
	*/
	public function __construct()
	{
		parent::__construct();
		
		$extensions = self::loadExtensions(array(
			'types'	=>	array('links')
		));
		
		// Load all link extensions		
		foreach($extensions['links'] as $link) {
			$this->extensions[] =$this->getLinkExtension($link);
		}
		
		$request = WFRequest::getInstance();
		$request->setRequest(array($this, 'getLinks'));
	}
	
	public function display()
	{		
		parent::display();
		
		$document = WFDocument::getInstance();
		$document->addScript(array('tree'), 'libraries');
		$document->addScript(array('link'), 'extensions.browser.js');
		
		$document->addStyleSheet(array('tree'), 'libraries');
		
		foreach ($this->extensions as $extension) {
			$extension->display();
		}
	}

	private function &getLinkExtension($name)
	{
		static $links;
		
		if (!isset( $links )) {
			$links = array();
		}
		
		if (empty($links[$name])) {
			$classname = 'WFLinkBrowser_' . ucfirst($name);
			if (class_exists($classname)) {
				$links[$name] = new $classname();			
			}
		}

		return $links[$name];
	}
	
    public function getLinkBrowser()
	{	
		$list = array();
			
		foreach ($this->extensions as $extension) {
			if ($extension->isEnabled()) {
				$list[] = $extension->getList();
			}
		}
		
		if (count($list)) {
			$view = $this->getView('links');	
			$view->assign('list', implode("\n", $list));
			$view->display();
		}
	}

    public function getLinks($args)
	{	    
	    foreach ($this->extensions as $extension) {
	        if (in_array($args->option, $extension->getOption())) {
	            $items = $extension->getLinks($args);
	        }
	    }
	    $array = array();
	    $result = array();
	    if (isset($items)) {
	        foreach ($items as $item) {
	            $array[] = array(
					'id'	=>	isset($item['id']) 	? WFEditor::xmlEncode($item['id']) 	: '',
	            	'url'	=>	isset($item['url']) ? WFEditor::xmlEncode($item['url']) : '',
	               	'name'	=>	WFEditor::xmlEncode($item['name']), 'class'=>$item['class']);
	        }
	        $result = array('folders'=>$array);
	    }
	    return $result;
	}

	/**
	 * Category function used by many extensions
	 *
	 * @access	public
	 * @return	Category list object.
	 * @since	1.5
	 */
	public function getCategory($section, $parent = 1)
	{
		$db			= JFactory::getDBO();
		$user		= JFactory::getUser();
		$wf 		= WFEditorPlugin::getInstance();

		$query = 'SELECT id AS slug, id AS id, title, alias, access';
		
		if ($wf->getParam('category_alias', 1) == 1) {
			$dbquery = $db->getQuery(true);
			
			if (is_object($dbquery)) {
				//sqlsrv changes
		        $case_when = ' CASE WHEN ';
		        $case_when .= $dbquery->charLength('alias');
		        $case_when .= ' THEN ';
		        $a_id = $dbquery->castAsChar('id');
		        $case_when .= $dbquery->concatenate(array($a_id, 'alias'), ':');
		        $case_when .= ' ELSE ';
		        $case_when .= $a_id.' END as slug';
			} else {
				$case_when = ' CASE WHEN CHAR_LENGTH(alias) THEN CONCAT_WS(":", id, alias) ELSE id END as slug';
			}	
			
			$query .= ',' . $case_when;			
		}
		
		if (method_exists('JUser', 'getAuthorisedViewLevels')) {
			$where  = ' WHERE parent_id = '.(int) $parent;
			$where .= ' AND extension = '.$db->Quote($section);
			$where .= ' AND access IN ('.implode(',', $user->authorisedLevels()).')';
			
			if (!$wf->checkAccess('static', 1)) {
				$where .= ' AND path != '.$db->Quote('uncategorised');
			}
		} else {
			$where  = ' WHERE section = '.$db->Quote($section);
			$where .= ' AND access <= '.(int) $user->get('aid');
		}
		
		$query .= ' FROM #__categories'
		. $where
		. ' AND published = 1'
		. ' ORDER BY title'
		;
		$db->setQuery($query);
		
		return $db->loadObjectList();		
	}
	
	/**
	 * (Attempt to) Get an Itemid
	 *
	 * @access	public
	 * @param	string $component
	 * @param	array $needles
	 * @return	Category list object.
	 */
	public function getItemId($component, $needles = array())
	{		
		$match = null;
		
		require_once(JPATH_SITE.DS.'includes'.DS.'application.php');
		
		$tag 		= WF_JOOMLA15 ? 'componentid' : 'component_id';
		
		$component 	= JComponentHelper::getComponent($component);
		$menu 		= JSite::getMenu();		
		$items 		= $menu->getItems($tag, $component->id);
		
		if ($items) {
			foreach ($needles as $needle => $id) {
				foreach ($items as $item) {
					if ((@$item->query['view'] == $needle) && (@$item->query['id'] == $id)) {
						$match = $item->id;
						break;
					}
				}
				if (isset($match)) {
					break;
				}
			}
		}
		return $match ? '&Itemid='.$match : '';
	}
}
