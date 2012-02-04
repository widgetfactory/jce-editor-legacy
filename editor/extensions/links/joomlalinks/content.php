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

defined( '_WF_EXT' ) or die('RESTRICTED');
class JoomlalinksContent extends JObject {
	
	var $_option = 'com_content';
	/**
	* Constructor activating the default information of the class
	*
	* @access	protected
	*/
	function __construct($options = array()){
	}
	
	/**
	 * Returns a reference to a editor object
	 *
	 * This method must be invoked as:
	 * 		<pre>  $browser =JContentEditor::getInstance();</pre>
	 *
	 * @access	public
	 * @return	JCE  The editor object.
	 * @since	1.5
	 */
	function &getInstance()
	{
		static $instance;

		if ( !is_object( $instance ) ){
			$instance = new JoomlalinksContent();
		}
		return $instance;
	}
	
	public function getOption()
	{
		return $this->_option;
	}
	
	public function getList()
	{
		$wf = WFEditorPlugin::getInstance();
		
		if ($wf->checkAccess('links.joomlalinks.content', 1)) {
			return '<li id="index.php?option=com_content"><div class="tree-row"><div class="tree-image"></div><span class="folder content nolink"><a href="javascript:;">' . WFText::_('WF_LINKS_JOOMLALINKS_CONTENT') . '</a></span></div></li>';
		}	
	}
	
	public function getLinks($args)
	{		
		$wf = WFEditorPlugin::getInstance();
		
		require_once(JPATH_SITE .DS. 'components' .DS. 'com_content' .DS. 'helpers' .DS. 'route.php');

		$items 		= array();
		$view		= isset($args->view) ? $args->view : '';
		
		switch ($view) {
			// get top-level sections / categories
			default:
				$sections = self::_getSection();
				
				foreach ($sections as $section) {
					$url 	= '';
					
					// Joomla! 1.5	
					if (method_exists('ContentHelperRoute', 'getSectionRoute')) {
						$id 	= ContentHelperRoute::getSectionRoute($section->id);
						$view 	= 'section';
					} else {
						$id = ContentHelperRoute::getCategoryRoute($section->slug);
						$view 	= 'category';
					}
					
					if (strpos($id, 'index.php?Itemid=') !== false) {
						$url 	= self::_getMenuLink($id);
						$id 	= 'index.php?option=com_content&view=' . $view . '&id=' . $section->id;
					}
					
					$items[] = array(
						'url'		=>  $url,
						'id'		=>	$id,
						'name'		=>	$section->title,
						'class'		=>	'folder content'
					);
				}
				// Check Static/Uncategorized permissions
				if (WF_JOOMLA15 && $wf->checkAccess('static', 1)) {
					$items[] = array(
						'id'		=>	'option=com_content&amp;view=uncategorized',
						'name'		=>	WFText::_('WF_LINKS_JOOMLALINKS_UNCATEGORIZED'),
						'class'		=>	'folder content nolink'
					);
				}
				break;
			// get categories in section or sub-categories (Joomla! 1.6+)
			case 'section':		
				$articles = array();
				
				// Joomla! 1.5
				if (method_exists('ContentHelperRoute', 'getSectionRoute')) {
					$categories = WFLinkBrowser::getCategory($args->id, 'com_content');
				} else {
					$categories = WFLinkBrowser::getCategory('com_content', $args->id);
					
					// get any articles in this category (in Joomla! 1.6+ a category can contain sub-categories and articles)
					$articles = self::_getArticles($args->id);
				}	

				foreach ($categories as $category) {				
					$url 	= '';
					$id 	= ContentHelperRoute::getCategoryRoute($category->id, $args->id);
				
					if (strpos($id, 'index.php?Itemid=') !== false) {
						$url 	= self::_getMenuLink($id);
						$id 	= 'index.php?option=com_content&view=category&id=' . $category->id;
					}

					$items[] = array(
						'url'		=> $url,
						'id'		=>	$id,
						'name'		=>	$category->title . ' / ' . $category->alias,
						'class'		=>	'folder content'
					);
				}
				
				if (!empty($articles)) {
					// output article links
					foreach ($articles as $article) {
						// Joomla! 1.5
						if (isset($article->sectionid)) {
							$id = ContentHelperRoute::getArticleRoute($article->slug, $article->catslug, $article->sectionid);
						} else {			
							$id = ContentHelperRoute::getArticleRoute($article->slug, $article->catslug);
						}
						
						$items[] = array(
							'id' 	=> $id,
							'name' 	=> $article->title . ' / ' . $article->alias,
							'class'	=> 'file'
						);
					}
				}

				break;
			// get articles and / or sub-categories
			case 'category':
				// get any articles in this category (in Joomla! 1.6+ a category can contain sub-categories and articles)
				$articles = self::_getArticles($args->id);
				
				if (!WF_JOOMLA15) {
					// get sub-categories
					$categories = WFLinkBrowser::getCategory('com_content', $args->id);
					
					if (count($categories)) {
						foreach ($categories as $category) {
							// check for sub-categories					
							$sub 	= WFLinkBrowser::getCategory('com_content', $category->id);	
						
							$url 	= '';
							$id 	= ContentHelperRoute::getCategoryRoute($category->id, $args->id);

							// get sub-categories
							if (count($sub)) {
								$url 	= $id;
								$id 	= 'index.php?option=com_content&view=section&id=' . $category->id;
							// no sub-categories, get articles for category
							} else {
								// no com_content, might be link like index.php?ItemId=1
								if (strpos($id, 'index.php?Itemid=') !== false) {
									$url 	= $id;
									$id 	= 'index.php?option=com_content&view=category&id=' . $category->id;
								}
							}
							
							if (strpos($url, 'index.php?Itemid=') !== false) {
								$url = self::_getMenuLink($url);
							}

							$items[] = array(
								'url'		=> 	$url,
								'id'		=>	$id,
								'name'		=>	$category->title . ' / ' . $category->alias,
								'class'		=>	'folder content'
							);
						}
					}
				}
				
				// output article links
				foreach ($articles as $article) {
					// Joomla! 1.5
					if (isset($article->sectionid)) {
						$id = ContentHelperRoute::getArticleRoute($article->slug, $article->catslug, $article->sectionid);
					} else {			
						$id = ContentHelperRoute::getArticleRoute($article->slug, $article->catslug);
					}
					
					$items[] = array(
						'id' 	=> $id,
						'name' 	=> $article->title . ' / ' . $article->alias,
						'class'	=> 'file'
					);
				}
	
				break;
			case 'uncategorized':			
				$statics = self::_getUncategorized();
				foreach ($statics as $static) {					
					$items[] = array(
						'id' 	=> ContentHelperRoute::getArticleRoute($static->id), 
						'name' 	=> 	$static->title . ' / ' . $static->alias,
						'class'	=>	'file'
					);
				}
				break;
		}
		return $items;
	}
	
	private function _getMenuLink($url)
	{
		$db	= JFactory::getDBO();
		// get itemid
		preg_match('#Itemid=([\d]+)#', $url, $matches);
		// get link from menu
		if (count($matches) > 1) {
			$menu = JTable::getInstance('menu');
			$menu->load($matches[1]);
				
			if ($menu->link) {
				return $menu->link . '&Itemid=' . $menu->id;
			}
		}
	
		return $url;
	
	}

	private function _getSection()
	{
		$db		= JFactory::getDBO();
		$user	= JFactory::getUser();
		
		if (method_exists('JUser', 'getAuthorisedViewLevels')) {
			return WFLinkBrowser::getCategory('com_content');
		} else {
			$query = 'SELECT id, title, alias, access'
			. ' FROM #__sections'
			. ' WHERE published = 1'
			. ' AND access <= '.(int) $user->get('aid')
			//. ' GROUP BY id'
			. ' ORDER BY title'
			;
	
			$db->setQuery($query);
			return $db->loadObjectList();	
		}	
	}
	
	private function _getArticles($id)
	{
		$db			= JFactory::getDBO();
		$user		= JFactory::getUser();
		$wf 		= WFEditorPlugin::getInstance();
		
		if (method_exists('JUser', 'getAuthorisedViewLevels')) {
			$query = 'SELECT a.id AS slug, b.id AS catslug, a.alias, a.title AS title, a.access';
		} else {
			$query = 'SELECT a.id AS slug, b.id AS catslug, a.alias, a.title AS title, u.id AS sectionid, a.access';	
		}
		
		if ($wf->getParam('links.joomlalinks.article_alias', 1) == 1) {
			$dbquery = $db->getQuery(true);
			
			if (is_object($dbquery)) {
				//sqlsrv changes
				$case_when1  = ' CASE WHEN ';
				$case_when1 .= $dbquery->charLength('a.alias');
				$case_when1 .= ' THEN ';
				$a_id = $dbquery->castAsChar('a.id');
				$case_when1 .= $dbquery->concatenate(array($a_id, 'a.alias'), ':');
				$case_when1 .= ' ELSE ';
				$case_when1 .= $a_id.' END as slug';
	
				$case_when2  = ' CASE WHEN ';
				$case_when2 .= $dbquery->charLength('b.alias');
				$case_when2 .= ' THEN ';
				$c_id = $dbquery->castAsChar('b.id');
				$case_when2 .= $dbquery->concatenate(array($c_id, 'b.alias'), ':');
				$case_when2 .= ' ELSE ';
				$case_when2 .= $c_id.' END as catslug';
			} else {
				$case_when1  = ' CASE WHEN CHAR_LENGTH(a.alias) THEN CONCAT_WS(":", a.id, a.alias) ELSE a.id END as slug';
				$case_when2  = ' CASE WHEN CHAR_LENGTH(b.alias) THEN CONCAT_WS(":", b.id, b.alias) ELSE b.id END as catslug';
			}
						
			$query .= ',' . $case_when1 . ',' . $case_when2;
		}
		
		$join 	= '';
		$where 	= '';
		
		if (method_exists('JUser', 'getAuthorisedViewLevels')) {
			$where	.= ' AND a.access IN ('.implode(',', $user->getAuthorisedViewLevels()).')';
		} else {
			$join 	.= ' INNER JOIN #__sections AS u ON u.id = a.sectionid';
			$where  .= ' AND a.access <= '.(int) $user->get('aid');
		}
		
		$query .= ' FROM #__content AS a'
		. ' INNER JOIN #__categories AS b ON b.id = '.(int) $id
		. $join
		. ' WHERE a.catid = '.(int) $id
		. ' AND a.state = 1'
		. $where
		. ' ORDER BY a.title'
		;
		
		$db->setQuery($query, 0);
		return $db->loadObjectList();
	}
	
	private function _getUncategorized()
	{
		$db		= JFactory::getDBO();
		$user	= JFactory::getUser();
		
		$where 	= '';
		
		if (method_exists('JUser', 'getAuthorisedViewLevels')) {
			$where	.= ' AND access IN ('.implode(',', $user->getAuthorisedViewLevels()).')';
		} else {
			$where  .= ' AND access <= '.(int) $user->get('aid') . ' AND sectionid = 0';
		}
		
		$query = 'SELECT id, title, alias, access'
		. ' FROM #__content'
		. ' WHERE state = 1'
		. $where
		. ' AND catid = 0'
		. ' ORDER BY title'
		;
		$db->setQuery($query, 0);
		return $db->loadObjectList();
	}
	
	private function getItemId($url)
	{
	}
}
?>