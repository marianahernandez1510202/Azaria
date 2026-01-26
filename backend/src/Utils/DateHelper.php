<?php
namespace App\Utils;
class DateHelper {
    public static function format($date, $format = 'Y-m-d H:i:s') {
        return date($format, strtotime($date));
    }
    
    public static function diffInDays($date1, $date2) {
        $d1 = new \DateTime($date1);
        $d2 = new \DateTime($date2);
        return $d1->diff($d2)->days;
    }
}
