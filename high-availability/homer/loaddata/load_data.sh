#!/bin/bash
sqluser=root
sqlpassword=secret
sqlhomeruser=homer
sqlhomerpassword=homersecret

SQL_LOCATION=/sql

echo "Creating Databases..."
mysql --host mysql -u "$sqluser" -p"$sqlpassword" -e "create database IF NOT EXISTS homer_db;";
mysql --host mysql -u "$sqluser" -p"$sqlpassword" -e "create database IF NOT EXISTS homer_users;";
echo "Creating Users..."
mysql --host mysql -u "$sqluser" -p"$sqlpassword" -e "GRANT ALL ON *.* TO '$sqlhomeruser'@'%' IDENTIFIED BY '$sqlhomerpassword'; FLUSH PRIVILEGES;";
echo "Creating Tables..."
mysql --host mysql -u "$sqluser" -p"$sqlpassword" homer_db < $SQL_LOCATION/sql/create_sipcapture_version_4.sql
mysql --host mysql -u "$sqluser" -p"$sqlpassword" homer_db < $SQL_LOCATION/sql/create_rtcp_version_1.sql
mysql --host mysql -u "$sqluser" -p"$sqlpassword" homer_db < $SQL_LOCATION/webhomer/statistics.sql
mysql --host mysql -u "$sqluser" -p"$sqlpassword" homer_users < $SQL_LOCATION/webhomer/homer_users.sql
mysql --host mysql -u "$sqluser" -p"$sqlpassword" homer_users -e "TRUNCATE TABLE homer_nodes;"
echo "Creating local DB Node..."
mysql --host mysql -u "$sqluser" -p"$sqlpassword" homer_users -e "INSERT INTO homer_nodes VALUES(1,'mysql','homer_db','3306','"$sqlhomeruser"','"$sqlhomerpassword"','sip_capture','node1', 1);"