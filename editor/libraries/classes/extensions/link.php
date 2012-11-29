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

wfimport('editor.libraries.classes.extensions');

class WFLinkExtension extends WFExtension {
    /*
     *  @var varchar
     */

    private $extensions = array();

    /**
     * Constructor activating the default information of the class
     *
     * @access	protected
     */
    public function __construct() {
        parent::__construct();

        $extensions = self::loadExtensions('links');

        // Load all link extensions		
        foreach ($extensions as $link) {
            $this->extensions[] = $this->getLinkExtension($link);
        }

        $request = WFRequest::getInstance();
        $request->setRequest(array($this, 'getLinks'));
    }
    
    public function getInstance($config = array()) {
        static $instance;

        if (!is_object($instance)) {
            $instance = new WFLinkExtension($config);
        }
        return $instance;
    }

    public function display() {
        parent::display();

        $document = WFDocument::getInstance();
        $document->addScript(array('tree', 'link'), 'libraries');

        $document->addStyleSheet(array('tree'), 'libraries');

        foreach ($this->extensions as $extension) {
            $extension->display();
        }
    }

    private function getLinkExtension($name) {
        static $links;

        if (!isset($links)) {
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

    public function render() {
        $list = array();

        foreach ($this->extensions as $extension) {
            if ($extension->isEnabled()) {
                $list[] = $extension->getList();
            }
        }

        if (count($list)) {
            $view = $this->getView('links', 'links');
            $view->assign('list', implode("\n", $list));
            $view->display();
        }
    }

    public function getLinks($args) {
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
                    'id' => isset($item['id']) ? self::xmlEncode($item['id']) : '',
                    'url' => isset($item['url']) ? self::xmlEncode($item['url']) : '',
                    'name' => self::xmlEncode($item['name']), 'class' => $item['class']
                );
            }
            $result = array('folders' => $array);
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
    public function getCategory($section, $parent = 1) {
        $db = JFactory::getDBO();
        $user = JFactory::getUser();
        $wf = WFEditorPlugin::getInstance();

        $query = $db->getQuery(true);
        
        $where = array();

        if (method_exists('JUser', 'getAuthorisedViewLevels')) {
            $where[] = 'parent_id = ' . (int) $parent;
            $where[] = 'extension = ' . $db->Quote($section);
            $where[] = 'access IN (' . implode(',', $user->getAuthorisedViewLevels()) . ')';

            if (!$wf->checkAccess('static', 1)) {
                $where[] = 'path != ' . $db->Quote('uncategorised');
            }
        } else {
            $where[] = 'section = ' . $db->Quote($section);
            $where[] = 'access <= ' . (int) $user->get('aid');
        }
        
        if ($wf->getParam('category_alias', 1) == 1) {
            if (is_object($query)) {
                //sqlsrv changes
                $case = ' CASE WHEN ';
                $case .= $query->charLength('alias');
                $case .= ' THEN ';
                $a_id  = $query->castAsChar('id');
                $case .= $query->concatenate(array($a_id, 'alias'), ':');
                $case .= ' ELSE ';
                $case .= $a_id . ' END as slug';
            } else {
                $case .= ', CASE WHEN CHAR_LENGTH(alias) THEN CONCAT_WS(":", id, alias) ELSE id END as slug';
            }
        }
        
        if (is_object($query)) {
            $where[] = 'published = 1';
            $query->select('id AS slug, id AS id, title, alias, access, ' . $case)->from('#__categories')->where($where)->order('title');
        } else {
            $query  = 'SELECT id AS slug, id AS id, title, alias, access' . $case;
            $query .= ' FROM #__categories';
            $query .= ' WHERE ' . implode(' AND ', $where);
            $query .= ' ORDER BY title';
        }
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
    public function getItemId($component, $needles = array()) {
        $match = null;

        require_once(JPATH_SITE . '/includes/application.php');

        $tag = defined('JPATH_PLATFORM') ? 'component_id' : 'componentid';

        $component = JComponentHelper::getComponent($component);
        $menu = JSite::getMenu();
        $items = $menu->getItems($tag, $component->id);

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
        return $match ? '&Itemid=' . $match : '';
    }

    /**
     * XML encode a string.
     *
     * @access	public
     * @param 	string	String to encode
     * @return 	string	Encoded string
     */
    private static function xmlEncode($string) {
        return str_replace(array('&', '<', '>', "'", '"'), array('&amp;', '&lt;', '&gt;', '&apos;', '&quot;'), $string);
    }
}

abstract class WFLinkBrowser extends WFLinkExtension {}
