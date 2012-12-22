<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2012 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 *   
 */
class WFMobileDetect {

    public function __construct() {
        jimport('joomla.environment.browser');
        // run detection
        $this->detect();
    }

    /*
     * Baseed on Categorizr 1.1
     * http://www.brettjankord.com/2012/01/16/categorizr-a-modern-device-detection-script/
     * Written by Brett Jankord - Copyright © 2011
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU Lesser General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
     * GNU Lesser General Public License for more details.
     * You should have received a copy of the GNU General Public License
     * and GNU Lesser General Public License
     * along with this program. If not, see http://www.gnu.org/licenses/.
     */

    private function detect() {        
        $browser = JBrowser::getInstance();
        // get User Agent string
        $ua = $browser->getAgentString();

        // Check if user agent is a Tablet
        if ((preg_match('/iP(a|ro)d/i', $ua)) || (preg_match('/tablet/i', $ua)) && (!preg_match('/RX-34/i', $ua)) || (preg_match('/FOLIO/i', $ua))) {
            $this->device = "tablet";
        }
        // Check if user agent is an Android Tablet
        else if ((preg_match('/Linux/i', $ua)) && (preg_match('/Android/i', $ua)) && (!preg_match('/Fennec|mobi|HTC.Magic|HTCX06HT|Nexus.One|SC-02B|fone.945/i', $ua))) {
            $this->device = "tablet";
        }
        // Check if user agent is a Kindle or Kindle Fire
        else if ((preg_match('/Kindle/i', $ua)) || (preg_match('/Mac.OS/i', $ua)) && (preg_match('/Silk/i', $ua))) {
            $this->device = "tablet";
        }
        // Check if user agent is a pre Android 3.0 Tablet
        else if ((preg_match('/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC(.Flyer|\_Flyer)|Sprint.ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos.S7|Dell.Streak.7|Advent.Vega|A101IT|A70BHT|MID7015|Next2|nook/i', $ua)) || (preg_match('/MB511/i', $ua)) && (preg_match('/RUTEM/i', $ua))) {
            $this->device = "tablet";
        }
        // Check if user agent is unique Mobile User Agent	
        else if ((preg_match('/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google.Wireless.Transcoder/i', $ua))) {
            $this->device = "mobile";
        }
        // Check if user agent is an odd Opera User Agent - http://goo.gl/nK90K
        else if ((preg_match('/Opera/i', $ua)) && (preg_match('/Windows.NT.5/i', $ua)) && (preg_match('/HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i', $ua))) {
            $this->device = "mobile";
        }
        // Check if user agent is Windows Desktop
        else if ((preg_match('/Windows.(NT|XP|ME|9)/', $ua)) && (!preg_match('/Phone/i', $ua)) || (preg_match('/Win(9|.9|NT)/i', $ua))) {
            $this->device = "desktop";
        }
        // Check if agent is Mac Desktop
        else if ((preg_match('/Macintosh|PowerPC/i', $ua)) && (!preg_match('/Silk/i', $ua))) {
            $this->device = "desktop";
        }
        // Check if user agent is a Linux Desktop
        else if ((preg_match('/Linux/i', $ua)) && (preg_match('/X11/i', $ua))) {
            $this->device = "desktop";
        }
        // Check if user agent is a Solaris, SunOS, BSD Desktop
        else if ((preg_match('/Solaris|SunOS|BSD/i', $ua))) {
            $this->device = "desktop";
        }
        // Check if user agent is a Desktop BOT/Crawler/Spider (use JBrowser)
        else if ($browser->isRobot()) {
            $this->device = "desktop";
        }
        // Otherwise assume it is a Desktop Device
        else {
            $this->device = "desktop";
        }
    }

    /**
     * Check if the device is mobile.
     * Returns true if any type of mobile device detected, including special ones
     * @return bool
     */
    public function isMobile() {

        return $this->device == "mobile";
    }

    /**
     * Check if the device is a tablet.
     * Return true if any type of tablet device is detected.
     * @return bool
     */
    public function isTablet() {
        return $this->device == "tablet";
    }
}