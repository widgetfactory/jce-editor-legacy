<?php
/**
 * @author Moxiecode
 * @copyright Copyright (c) 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

class GoogleSpell extends SpellChecker {
	/**
	 * Spellchecks an array of words.
	 *
	 * @param {String} $lang Language code like sv or en.
	 * @param {Array} $words Array of words to spellcheck.
	 * @return {Array} Array of misspelled words.
	 */
	function &checkWords($lang, $words) {		
		$wordstr = implode(' ', $words);
		$matches = $this->_getMatches($lang, $wordstr);

		/*$words = array();

		for ($i=0; $i<count($matches); $i++)
			$words[] = $this->_unhtmlentities(mb_substr($wordstr, $matches[$i][1], $matches[$i][2], "UTF-8"));

		return $words;*/
                
                return $matches;
	}

	/**
	 * Returns suggestions of for a specific word.
	 *
	 * @param {String} $lang Language code like sv or en.
	 * @param {String} $word Specific word to get suggestions for.
	 * @return {Array} Array of suggestions for the specified word.
	 */
	function &getSuggestions($lang, $word) {
		$sug = array();
		$osug = array();
		$matches = $this->_getMatches($lang, $word);

		/*if (count($matches) > 0){
			$s = $this->_unhtmlentities($matches[0][4]);			
			$sug = explode("\t", preg_match('/&[^;]+;/', $s) ? utf8_encode($s) : $s);
		}

		// Remove empty
		foreach ($sug as $item) {
			if ($item)
				$osug[] = $item;
		}

		return $osug;*/
                
                 return $matches;
	}

	protected function &_getMatches($lang, $str) {
                $lang   = preg_replace('/[^a-z\-]/i', '', $lang); // Sanitize, remove everything but a-z or -
                $str    = preg_replace('/[\x00-\x1F\x7F]/', '', $str); // Sanitize, remove all control characters
            
		//$server = "www.google.com";
                $server = "www.googleapis.com";
		$port = 443;
		//$path = "/tbproxy/spell?lang=" . $lang . "&hl=en";
                $path = "/rpc";
		//$host = "www.google.com";
		$url = "https://" . $server . ":" . $port . $path;

		// Setup XML request
		/*$xml = '<?xml version="1.0" encoding="utf-8" ?><spellrequest textalreadyclipped="0" ignoredups="0" ignoredigits="1" ignoreallcaps="1"><text>' . $str . '</text></spellrequest>';*/

		$data = array('method' => 'spelling.check', 'apiVersion' => 'v2', 'params' => array('language' => $lang, 'text' => $str, 'key' => 'AIzaSyCLlKc60a3z7lo8deV-hAyDU7rHYgL4HZg'));
                
                $header  = "POST ".$path." HTTP/1.0 \r\n";
		$header .= "MIME-Version: 1.0 \r\n";
		//$header .= "Content-type: application/PTI26 \r\n";
                $header .= "Content-type: application/json";
		$header .= "Content-length: ".strlen($xml)." \r\n";
		$header .= "Content-transfer-encoding: text \r\n";
		$header .= "Request-number: 1 \r\n";
		$header .= "Document-type: Request \r\n";
		$header .= "Interface-Version: Test 1.4 \r\n";
		$header .= "Connection: close \r\n\r\n";
		$header .= json_encode($data);

		// Use curl if it exists
		if (function_exists('curl_init')) {
			// Use curl
			$ch = curl_init();                        
                        
                        curl_setopt($ch, CURLOPT_URL, $url);
                        curl_setopt($ch, CURLOPT_HEADER, 0);

                        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
                        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

                        // The @ sign allows the next line to fail if open_basedir is set or if safe mode is enabled
                        //@curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
                        //@curl_setopt($ch, CURLOPT_MAXREDIRS, 20);

                        @curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                        
                        curl_setopt($ch, CURLOPT_POST, 1);
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
                        
			$response = curl_exec($ch);
			
			if ($response === false) {
				$this->throwError('Invalid Server Response');
			} else {
				$res = $response;
			}
			
			curl_close($ch);
		} else {
			// Use raw sockets
			$fp = fsockopen("ssl://" . $server . $path, $port, $errno, $errstr, 30);
			if ($fp) {
				// Send request
				fwrite($fp, $header);

				// Read response
				$res = "";
				while (!feof($fp))
					$res .= fgets($fp, 128);

				fclose($fp);
			} else {
				//echo "Could not open SSL connection to google.";
				$this->throwError('Could not open SSL connection to google.');
			}
		}

		// Grab and parse content
		/*$matches = array();
		preg_match_all('/<c o="([^"]*)" l="([^"]*)" s="([^"]*)">([^<]*)<\/c>/', $xml, $matches, PREG_SET_ORDER);

		return $matches;*/
                
                return json_decode($res, true);
	}

	protected function _unhtmlentities($string) {
		$string = preg_replace('~&#x([0-9a-f]+);~ei', 'chr(hexdec("\\1"))', $string);
		$string = preg_replace('~&#([0-9]+);~e', 'chr(\\1)', $string);

		$trans_tbl = get_html_translation_table(HTML_ENTITIES);
		$trans_tbl = array_flip($trans_tbl);

		return strtr($string, $trans_tbl);
	}
}

// Patch in multibyte support
if (!function_exists('mb_substr')) {
	function mb_substr($str, $start, $len = '', $encoding="UTF-8"){
		$limit = strlen($str);

		for ($s = 0; $start > 0;--$start) {// found the real start
			if ($s >= $limit)
				break;

			if ($str[$s] <= "\x7F")
				++$s;
			else {
				++$s; // skip length

				while ($str[$s] >= "\x80" && $str[$s] <= "\xBF")
					++$s;
			}
		}

		if ($len == '')
			return substr($str, $s);
		else
			for ($e = $s; $len > 0; --$len) {//found the real end
				if ($e >= $limit)
					break;

				if ($str[$e] <= "\x7F")
					++$e;
				else {
					++$e;//skip length

					while ($str[$e] >= "\x80" && $str[$e] <= "\xBF" && $e < $limit)
						++$e;
				}
			}

		return substr($str, $s, $e - $s);
	}
}

?>
