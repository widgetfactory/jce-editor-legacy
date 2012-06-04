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

class WFSearchBrowser extends WFBrowserExtension {

    /**
     * Constructor activating the default information of the class
     *
     * @access	protected
     */
    public function __construct() {
        parent::__construct();

        $request = WFRequest::getInstance();
        $request->setRequest(array($this, 'doSearch'));
    }

    public function display() {
        parent::display();

        $document = WFDocument::getInstance();
        $document->addScript(array('search'), 'extensions.browser.js');
        $document->addStylesheet(array('search'), 'extensions.browser.css');
    }

    /**
     * Method to get the search areas
     */
    private static function getAreas() {

        $areas = array();

        JPluginHelper::importPlugin('search');
        $dispatcher = JDispatcher::getInstance();
        $searchareas = $dispatcher->trigger('onContentSearchAreas');

        foreach ($searchareas as $area) {
            if (is_array($area)) {
                $areas = array_merge($areas, $area);
            }
        }

        return $areas;
    }

    public function render() {
        // built select lists
        $orders = array();
        $orders[] = JHtml::_('select.option', 'newest', JText::_('WF_SEARCH_NEWEST_FIRST'));
        $orders[] = JHtml::_('select.option', 'oldest', JText::_('WF_SEARCH_OLDEST_FIRST'));
        $orders[] = JHtml::_('select.option', 'popular', JText::_('WF_SEARCH_MOST_POPULAR'));
        $orders[] = JHtml::_('select.option', 'alpha', JText::_('WF_SEARCH_ALPHABETICAL'));
        $orders[] = JHtml::_('select.option', 'category', JText::_('WF_CATEGORY'));

        $lists = array();
        $lists['ordering'] = JHtml::_('select.genericlist', $orders, 'ordering', 'class="inputbox"', 'value', 'text');

        $searchphrases = array();
        $searchphrases[] = JHtml::_('select.option', 'all', JText::_('WF_SEARCH_ALL_WORDS'));
        $searchphrases[] = JHtml::_('select.option', 'any', JText::_('WF_SEARCH_ANY_WORDS'));
        $searchphrases[] = JHtml::_('select.option', 'exact', JText::_('WF_SEARCH_EXACT_PHRASE'));
        $lists['searchphrase'] = JHtml::_('select.radiolist', $searchphrases, 'searchphrase', '', 'value', 'text');


        $view = $this->getView('search');

        $view->assign('searchareas', self::getAreas());
        $view->assignRef('lists', $lists);
        $view->display();
    }

    public function doSearch($query) {
        // get SearchHelper
        require_once(JPATH_ADMINISTRATOR . DS . 'components' . DS . 'com_search' . DS . 'helpers' . DS . 'search.php');

        // get saerch plugins
        JPluginHelper::importPlugin('search');

        // slashes cause errors, <> get stripped anyway later on. # causes problems.
        $badchars = array('#', '>', '<', '\\');
        $searchword = trim(str_replace($badchars, '', $query));
        
        $ordering       = JRequest::getWord('ordering', null, 'post');
	$searchphrase   = JRequest::getWord('searchphrase', 'all', 'post');
	$areas          = JRequest::getVar('areas', null, 'post', 'array');

        // if searchword enclosed in double quotes, strip quotes and do exact match
        if (substr($searchword, 0, 1) == '"' && substr($searchword, -1) == '"') {
            $searchword = substr($searchword, 1, -1);
            $searchphrase = 'exact';
        }

        if (!empty($areas)) {
            foreach ($areas as $area) {
                $areas[] = JFilterInput::getInstance()->clean($area, 'cmd');
            }
        }

        $dispatcher = JDispatcher::getInstance();
        $results = $dispatcher->trigger('onContentSearch', array(
            $searchword,
            $searchphrase,
            $ordering,
            $areas
        ));

        $rows = array();

        foreach ($results as $result) {
            $rows = array_merge((array) $rows, (array) $result);
        }

        for ($i = 0, $count = count($rows); $i < $count; $i++) {
            $row = &$rows[$i];

            if ($searchphrase == 'exact') {
                $searchwords = array($searchword);
                $needle = $searchword;
            } else {
                $searchworda = preg_replace('#\xE3\x80\x80#s', ' ', $searchword);
                $searchwords = preg_split("/\s+/u", $searchworda);
                $needle = $searchwords[0];
            }
            
            // get anchors
            $anchors = self::getAnchors($row->text);
            
            if (!empty($anchors)) {
                $row->anchors = $anchors;
            }

            $row->text = SearchHelper::prepareSearchContent($row->text, $needle);
            $searchwords = array_unique($searchwords);
            $searchRegex = '#(';
            $x = 0;

            foreach ($searchwords as $k => $hlword) {
                $searchRegex .= ($x == 0 ? '' : '|');
                $searchRegex .= preg_quote($hlword, '#');
                $x++;
            }
            $searchRegex .= ')#iu';

            $row->text = preg_replace($searchRegex, '<span class="highlight">\0</span>', $row->text);
            $row->link = preg_replace('#^administrator\/#', '', $row->href);
        }

        return $rows;
    }
    
    private static function getAnchors($content) {
        preg_match_all('#<a([^>]+)(name|id)="([a-z]+[\w\-\:\.]*)"([^>]*)>#i', $content, $matches, PREG_SET_ORDER);

        $anchors = array();

        if (!empty($matches)) {
            foreach ($matches as $match) {
                if (strpos($match[0], 'href') === false) {                    
                    $anchors[] = $match[3];
                }
            }
        }

        return $anchors;
    }

}