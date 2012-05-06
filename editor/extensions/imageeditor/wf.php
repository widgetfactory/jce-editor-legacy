<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('RESTRICTED');

define('WFIMAGE_PATH', dirname(__FILE__) . DS . 'wf' . DS . 'classes' . DS . 'image');

class WFImageEditorExtension_Wf extends WFImageEditorExtension {
    
    public function __construct($config = array()) {

        $request = WFRequest::getInstance();
        $request->setRequest(array($this, 'applyFilter'));

        parent::__construct($config);
    }

    public function display() {
        $document = WFDocument::getInstance();

        $wf = WFEditorPlugin::getInstance();
        $wf->display();

        parent::display();

        $document->addScript(array('wf', 'canvas', 'transform', 'editor'), 'extensions/imageeditor/wf/js');

        $document->addScriptDeclaration('tinyMCEPopup.onInit.add(EditorDialog.init, EditorDialog);');
        $document->addStyleSheet(array('editor', 'transform'), 'extensions/imageeditor/wf/css');
    }

    public function isEnabled() {
        $plugin = WFEditorPlugin::getInstance();
        return $plugin->checkAccess('imageeditor.jce.enable', 1);
    }

    public function getParams() {
        $wf = WFEditorPlugin::getInstance();

        return array(
            'resize_presets' => $wf->getParam('imgmanager_ext.resize_presets', '320x240,640x480,800x600,1024x768', '', 'string', false),
            'crop_preets' => $wf->getParam('imgmanager_ext.crop_presets', '4:3,16:9,20:30,320x240,240x320,640x480,480x640,800x600,1024x768', '', 'string', false)
        );
    }

    public function getPresetsList($type) {
        $list = array();

        $params = $this->getParams();

        switch ($type) {
            case 'resize' :
                $list = explode(',', $params['resize_presets']);
                break;
            case 'crop' :
                $list = explode(',', $params['crop_preets']);
                break;
        }

        return $list;
    }

    public function applyFilter($filter, $value = 0) {
        $data = JRequest::getVar('data', '', 'POST', 'STRING', JREQUEST_ALLOWRAW);

        if (preg_match('#^(data:image\/(jpeg|jpg|png|bmp);base64,)#', $data, $matches)) {

            $ext    = $matches[2];
            $header = $matches[1];

            //self::validateImageData($data);
            // replace spaces
            $data = str_replace(' ', '+', $data);
            // remove header
            $data = substr($data, strpos($data, ",") + 1);
            // decode data
            $data = base64_decode($data, true);

            if (!$data) {
                throw new RuntimeException('Invalid image data');
            }
            
            require_once(WFIMAGE_PATH . DS . 'image.php');
            
            $image = new WFImage();            
            $image->loadString($data);

            if ($filter == 'sharpen' && $value < 0) {
                $filter = 'blur';
                $value *= -1;
            }

            switch ($filter) {
                case 'brightness':
                    $image->filter('brightness', array($value));
                    break;
                case 'blur':
                    $value = $value / 10;

                    for ($i = 0; $i < (int) $value; $i++) {
                        $image->filter('blur');
                    }
                    break;
                case 'sharpen':
                    $value = min(9, round($value / 10) - 1);

                    //$value = $value * 2.55;

                    $matrix = array(
                        array
                            (
                            array(0, 0, 0),
                            array(-1, 3, -1),
                            array(0, 0, 0)
                        ),
                        array
                            (
                            array(0, -1, 0),
                            array(-1, 5, -1),
                            array(0, -1, 0)
                        ),
                        array
                            (
                            array(-1, -1, -1),
                            array(-1, 7, -1),
                            array(0, -1, 0)
                        ),
                        array
                            (
                            array(-1, -1, -1),
                            array(-1, 9, -1),
                            array(-1, -1, -1)
                        ),
                        array
                            (
                            array(-1, -1, -1),
                            array(-2, 11, -2),
                            array(-1, -1, -1)
                        ),
                        array
                            (
                            array(-1, -2, -1),
                            array(-2, 13, -2),
                            array(-1, -2, -1)
                        ),
                        array
                            (
                            array(-2, -2, -2),
                            array(-2, 15, -2),
                            array(-1, -2, -1)
                        ),
                        array
                            (
                            array(-2, -2, -2),
                            array(-2, 17, -2),
                            array(-2, -2, -2)
                        ),
                        array
                            (
                            array(-2, -2, -2),
                            array(-3, 19, -3),
                            array(-2, -2, -2)
                        ),
                        array
                            (
                            array(-2, -3, -2),
                            array(-3, 21, -3),
                            array(-2, -3, -2)
                        )
                    );

                    // calculate the sharpen divisor 
                    $divisor    = array_sum(array_map('array_sum', $matrix[$value]));
                    $offset     = 0;
                    $image->filter('convolution', array('matrix' => $matrix[$value], 'div' => (float)$divisor, 'offset' => (float)$offset));

                    break;
            }

            header('Content-Type: text/json;charset=UTF-8');
            header('Content-Encoding: UTF-8');
            header("Expires: Mon, 4 April 1984 05:00:00 GMT");
            header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
            header("Cache-Control: no-store, no-cache, must-revalidate");
            header("Cache-Control: post-check=0, pre-check=0", false);
            header("Pragma: no-cache");

            $data = $header . chunk_split(base64_encode($image->toString($ext)), 64, "\n");

            exit(json_encode(array('result' => array('data' => $data))));
        }

        return false;
    }

    public function save($args) {
        // file src
        $file = array_shift($args);

        // check file
        WFUtility::checkPath($file);

        // file name
        $name = array_shift($args);

        // check name
        WFUtility::checkPath($name);

        // edit data
        $props = array_shift($args);

        // exif data
        $exif = null;

        $data = JRequest::getVar('data', '', 'POST', 'STRING', JREQUEST_ALLOWRAW);

        if (preg_match('#^data:image\/(jpeg|jpg|png|bmp);base64#', $data, $matches)) {
            $ext    = $matches[2];
            $header = $matches[1];

            // replace spaces
            $data = str_replace(' ', '+', $data);
            // remove header
            $data = substr($data, strpos($data, ",") + 1);
            // decode data
            $data = base64_decode($data, true);

            if (!$data) {
                throw new RuntimeException('Invalid image data');
            }
            
            self::validateImageData($data);

            // absolute path to original image
            $src = WFUtility::makePath(JPATH_SITE, $file);
            // relative path to destination image
            $dest = dirname($file) . DS . basename($name);

            // get exif data from orignal file
            if (preg_match('#\.jp(eg|g)$#i', basename($file)) && basename($file) == basename($dest)) {
                // load exif classes
                require_once (dirname(__FILE__) . DS . 'pel' . DS . 'PelJpeg.php');

                $jpeg = new PelJpeg($src);
                $exif = $jpeg->getExif();
            }
            if ($exif && basename($file) == basename($dest)) {
                $pel = new PelDataWindow($data);

                if (PelJpeg::isValid($pel)) {
                    $jpeg = new PelJpeg();
                    $jpeg->load($pel);

                    $jpeg->setExif($exif);
                    $data = $jpeg->getBytes();
                }
            }

            return array(
                'file' => $dest,
                'data' => $data
            );
        }

        return false;
    }

    function resize($src, $dest = null, $width, $height, $quality, $sx = null, $sy = null, $sw = null, $sh = null) {
        jimport('joomla.filesystem.folder');
        jimport('joomla.filesystem.file');

        if (empty($dest)) {
            $dest = $src;
        }

        $ext = strtolower(JFile::getExt($src));

        if (is_file($src)) {
            require_once(WFIMAGE_PATH . DS . 'image.php');
            
            $image = new WFImage();            
            $image->loadFile($src);

            // cropped thumbnail
            if (($sx || $sy) && $sw && $sh) {                
                @$image->crop($sw, $sh, $sx, $sy, false);
                @$image->resize($width, $height, false);
            } else {
                @$image->resize($width, $height, false);
            }

            switch ($ext) {
                case 'jpg' :
                case 'jpeg' :
                    $quality = intval($quality);
                    if ($this->get('ftp', 0)) {
                        @JFile::write($dest, $image->toString($ext, array('quality' => $quality)));
                    } else {
                        @$image->toFile($dest, array('quality' => $quality));
                    }
                    break;
                default :
                    if ($this->get('ftp', 0)) {
                        @JFile::write($dest, $image->toString($ext));
                    } else {
                        @$image->toFile($dest);
                    }
                    break;
            }

            unset($image);
        }

        if (file_exists($dest)) {
            @JPath::setPermissions($dest);
            return $dest;
        }

        return false;
    }
    
    public static function validateImageData($data, $type)
    {                                        
        require_once(WFIMAGE_PATH . DS . 'image.php');
        
        // create image resource to validate
        $image = new WFImage();            
        
        if ($image->loadString($data)) {
            $image->destroy();
        }
    }

}