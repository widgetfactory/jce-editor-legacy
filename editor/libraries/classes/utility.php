<?php
/**
 * @version   $Id: utility.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('Restricted access');
class WFUtility
{
	/**
	 * Format a JError object as a JSON string
	 */
	public function raiseError($error)
	{
		$data = array();

		$data[] = JError::translateErrorLevel($error->get('level')) . ' ' . $error->get('code') . ': ';

		if ($error->get('message')) {
			$data[] = $error->get('message');
		}
		
		if ($error->get('code') >= 500) {
			if ($error->get('line')) {
				$data[] = ' IN LINE ' . $error->get('line');
			}
	
			if ($error->get('function')) {
				$text = ' IN ';
	
				if ($error->get('class')) {
					$text = $error->get('class') . '::';
				}
	
				$text = $error->get('function');
	
				$data[] = $text;
			}
	
			if ($error->get('file')) {
				$data[] = 'IN FILE ' . $error->get('file');
			}
		}
		
		header('Content-Type: text/json');
		header('Content-Encoding: UTF-8');
		
		$output = array(
			'result'	=> '',
        	'error'  	=> true,
			'code'	 	=> $error->get('code'),
			'text'		=> $data
		);

		exit(json_encode($output));
	}

	public function getExtension($path)
	{
		$parts = pathinfo($path);
		
		return $parts['extension'];
	}
	
	public function stripExtension($path)
	{
		$parts = pathinfo($path);
		
		if (isset($parts['filename'])) {
			return $parts['filename'];
		} else {
			return basename($path, '.' . $parts['extension']);
		}
	}

	/**
	 * Append a / to the path if required.
	 * @param string $path the path
	 * @return string path with trailing /
	 */
	public function fixPath($path)
	{
		//append a slash to the path if it doesn't exists.
		if (!(substr($path, -1) == '/'))
		$path .= '/';
		return $path;
	}
	
	public function checkPath($path)
	{
		if (strpos($path, '..') !== false) {
			JError::raiseError(403, 'Use of relative paths not permitted'); // don't translate
			exit();
		}
	}

	/**
	 * Concat two paths together. Basically $pathA+$pathB
	 * @param string $pathA path one
	 * @param string $pathB path two
	 * @return string a trailing slash combinded path.
	 */
	public function makePath($a, $b)
	{
		$a = self::fixPath($a);
		if (substr($b, 0, 1) == '/') {
			$b = substr($b, 1);
		}
		return $a . $b;
	}

	/**
	 * Makes file name safe to use
	 * @param string The name of the file (not full path)
	 * @return string The sanitised string
	 */
	public function makeSafe($file)
	{
		jimport('joomla.filesystem.file');
		return trim(JFile::makeSafe(preg_replace('#\s#', '_', $file)));
	}

	/**
	 * Format the file size, limits to Mb.
	 * @param int $size the raw filesize
	 * @return string formated file size.
	 */
	public function formatSize($size)
	{
		if ($size < 1024)
		return $size . ' ' . WFText::_('WF_LABEL_BYTES');
		else if ($size >= 1024 && $size < 1024 * 1024)
		return sprintf('%01.2f', $size / 1024.0) . ' ' . WFText::_('WF_LABEL_KB');
		else
		return sprintf('%01.2f', $size / (1024.0 * 1024)) . ' ' . WFText::_('WF_LABEL_MB');
	}

	/**
	 * Format the date.
	 * @param int $date the unix datestamp
	 * @return string formated date.
	 */
	public function formatDate($date, $format = "%d/%m/%Y, %H:%M")
	{
		return strftime($format, $date);
	}

	/**
	 * Get the modified date of a file
	 *
	 * @return Formatted modified date
	 * @param string $file Absolute path to file
	 */
	public function getDate($file)
	{
		return self::formatDate(@filemtime($file));
	}

	/**
	 * Get the size of a file
	 *
	 * @return Formatted filesize value
	 * @param string $file Absolute path to file
	 */
	public function getSize($file)
	{
		return self::formatSize(@filesize($file));
	}

	public function isUtf8($string)
	{
		if (!function_exists('mb_detect_encoding')) {
			// From http://w3.org/International/questions/qa-forms-utf-8.html 
	        return preg_match('%^(?: 
	              [\x09\x0A\x0D\x20-\x7E]          	 # ASCII 
	            | [\xC2-\xDF][\x80-\xBF]             # non-overlong 2-byte 
	            |  \xE0[\xA0-\xBF][\x80-\xBF]        # excluding overlongs 
	            | [\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}  # straight 3-byte 
	            |  \xED[\x80-\x9F][\x80-\xBF]        # excluding surrogates 
	            |  \xF0[\x90-\xBF][\x80-\xBF]{2}     # planes 1-3 
	            | [\xF1-\xF3][\x80-\xBF]{3}          # planes 4-15 
	            |  \xF4[\x80-\x8F][\x80-\xBF]{2}     # plane 16 
	        )*$%xs', $string); 
		}
		
		return mb_detect_encoding($string, 'UTF-8', true);
	}
	
	/**
	 * Convert size value to bytes
	 */
	function convertSize($value)
	{		
		// Convert to bytes
		switch(strtolower($value{strlen($value)-1})) {
			case 'g':
				$value = intval($value) * 1073741824;
				break;
			case 'm':
				$value = intval($value) * 1048576;
				break;
			case 'k':
				$value = intval($value) * 1024;
				break;
		}
		
		return $value;
	}
}
?>