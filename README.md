# Quick-Ambulance

An android application built with Aim to reduce the average calling time of Amblance in emergency situations.

Backend scripts are written using nodeJS and for database MongoDB has been used. 
In database there are two colections. First one conatins the database of All the Ambulances is the city while the second one stores the data about all the request made by users.
Application script ignores Duplicate request. It also allots the nearest available Ambulance to user and tells the user the current location of ambulance in Map.
Each user request is assigned a unique id which is the size of the users collection.

Search.js file contains all the scripts.
App.js file contains code for testing the script.

Refernces: http://blog.modulus.io/mongodb-tutorial
