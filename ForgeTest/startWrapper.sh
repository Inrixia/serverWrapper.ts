#!/bin/sh

while true
do
echo "##### SERVER STARTING #####"
node serverWrapper.js
echo "Restarting in:"
for i in 5 4 3 2 1
do
echo "$i..."
sleep 1
done
echo "Server Restarting!"
done