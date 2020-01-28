#!/bin/bash

echo "Starting replica set initialize"
until mongo --host mongo_db_1 --eval "print(\"waited for connection\")"
do
    sleep 2
done
echo "Connection finished"
echo "Creating replica set"
mongo --host mongo_db_1 <<EOF
rs.initiate()
EOF
echo "replica set created"