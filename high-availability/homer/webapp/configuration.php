<?php

if(!defined('HOMER_CONFIGURATION')):

define('HOMER_CONFIGURATION', 1);

/*********************************************************************************/
/* Access db of homer */
define('HOST', "{{ DB_HOST }}");
define('PORT', 3306);
define('USER', "{{ DB_USER }}");
define('PW', "{{ DB_PASS }}");
define('DB', "homer_users");

/* Homer connection 
*  this user must have the same password for all Homer nodes
*  please define all your nodes in homer_nodes table
*/
define('HOMER_HOST', "mysql"); /* DEFAULT. Don't forget insert this host to your DB nodes table */
define('HOMER_PORT', 3306);
define('HOMER_USER', "homer");
define('HOMER_PW', "homersecret");
define('HOMER_DB', "homer_db");
define('HOMER_TABLE', "sip_capture");

/*********************************************************************************/

/* webHomer Settings 
*  Adjust to reflect your system preferences
*/

define('PCAPDIR',"/var/www/html/webhomer/tmp/");
define('WEBPCAPLOC',"/tmp/");
define('APIURL',"http://localhost");
define('APILOC',"/api/");

/* INCLUDE preferences */

include_once("preferences.php");

endif;

?>