<?php
/*
 * Langauge Utility Class
 */
abstract class WFLanguage {
    
    protected static $instance;

    /*
     * Check a lnagueg file exists and is the correct version
     */
    protected static function check($tag) {
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
     * Return the curernt language code
     *
     * @access public
     * @return language code
     */
    public static function getDir() {
        $language   = JFactory::getLanguage();
        $tag        = self::getTag();

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
    public static function getTag() {
        $language   = JFactory::getLanguage();
        $tag        = $language->getTag();

        //static $_language;

        if (!isset(self::$instance)) {            
            if (self::check($tag)) {
                self::$instance = $tag;
            } else {
                self::$instance = 'en-GB';
            }
        }

        return self::$instance;
    }

    /**
     * Return the curernt language code
     *
     * @access public
     * @return language code
     */
    public static function getCode() {
        $tag = self::getTag();

        return substr($tag, 0, strpos($tag, '-'));
    }
    
    /**
     * Load a language file
     *
     * @param string $prefix Language prefix
     * @param object $path[optional] Base path
     */
    public static function load($prefix, $path = JPATH_SITE) {
        $language   = JFactory::getLanguage();           
        $tag        = self::getTag();

        $language->load($prefix, $path, $tag, true);
    }
}
?>
