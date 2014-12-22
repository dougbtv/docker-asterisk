CONTAINER=mysql
sqluser=root
sqlpassword=secret
sqlhomeruser=homer
sqlhomerpassword=homersecret

HOMER_LOCATION=/tmp/homer
rm -Rf $HOMER_LOCATION
git clone --depth 1 https://github.com/sipcapture/homer/ $HOMER_LOCATION

echo "Creating Databases..."
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" -e "create database IF NOT EXISTS homer_db;";
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" -e "create database IF NOT EXISTS homer_users;";
echo "Creating Users..."
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" -e "GRANT ALL ON *.* TO '$sqlhomeruser'@'%' IDENTIFIED BY '$sqlhomerpassword'; FLUSH PRIVILEGES;";
echo "Creating Tables..."
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" homer_db < $HOMER_LOCATION/sql/create_sipcapture_version_4.sql
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" homer_db < $HOMER_LOCATION/webhomer/sql/statistics.sql
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" homer_users < $HOMER_LOCATION/webhomer/sql/homer_users.sql
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" homer_users -e "TRUNCATE TABLE homer_nodes;"
echo "Creating local DB Node..."
docker exec -it mysql mysql -u "$sqluser" -p"$sqlpassword" homer_users -e "INSERT INTO homer_nodes VALUES(1,'127.0.0.1','homer_db','3306','"$sqlhomeruser"','"$sqlhomerpassword"','sip_capture','node1', 1);"
