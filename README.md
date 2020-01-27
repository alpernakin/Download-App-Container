# Download-App-Container
Download real-time map data and statistics representation

# Installation

## Backend

### MongoDB

Please [download MongoDB](https://www.mongodb.com/download-center/community). It will install the MongoDB server on the port 27017 by default (you can change it by setting a new port on [app.config.js](https://github.com/alpernakin/Download-App-Container/blob/master/backend/app.config.js))

For real-time data streaming, MongoDB [change streams](https://docs.mongodb.com/manual/changeStreams/) require replica sets, therefore we set up replicas, please follow the instructions:

[See original replica set installation instructions](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)

1. Shut down any running [Mongod service](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) (it can be stopped on services)

2. Command prompt on the MongoDB directory your_mongodb_dir/Server/your_mongodb_version/bin
   - Start a new mongod instance with --replSet, --dbPath and --port configuration
   - Example command: ```mongod --port 27017 --dbpath ../data/db0 --replSet rs0 --bind_ip 127.0.0.1```
   
3. Connect to a mongo shell: mongo.exe under your_mongodb_dir/Server/your_mongodb_version/bin
   - Initiate the replica set with the command: ```rs.initiate()```
   - See status and configuration with the commands: ```rs.conf()```, ```rs.status()```

### Server

Firstly command ```npm install``` to load node_modules on the backend directory

Then:

1. ```npm run start```
2. ```npm run test```

## Frontend

Firstly command ```npm install``` to load node_modules on the frontend directory

Then:

1. ```npm run start```
2. ```npm run test```

###### Note: If the first test is interrupted by uncaught dummy error, please try again.

## Data-Producer

Firstly command ```npm install``` to load node_modules on the data-producer directory

Then: ```npm run start```

###### Configuration: The data production and insertion options are on the [app.config.js file](https://github.com/alpernakin/Download-App-Container/blob/master/data-producer/assets/app.config.js)

# Documentation

## Backend

The API server has been developed with the techstack: **[ExpressJs](https://expressjs.com/), [Socket.IO](https://socket.io/), [Mongoose (ODM)](https://mongoosejs.com/), [Chai](https://www.chaijs.com/), [Mocha](https://mochajs.org/), [TestDouble](https://github.com/testdouble/testdouble.js)**

**App config** see the file [app.config.js](https://github.com/alpernakin/Download-App-Container/blob/master/backend/app.config.js)

**MongoDB schema and indexes** see the file [download.schema.js](https://github.com/alpernakin/Download-App-Container/blob/master/backend/mongodb/download.schema.js)

**Validators** see the file [validators.js](https://github.com/alpernakin/Download-App-Container/blob/master/backend/validator.js)

**Socket for real-time streaming** see the file [socket.js](https://github.com/alpernakin/Download-App-Container/blob/master/backend/socket.js)

**Test** see the files under [test folder](https://github.com/alpernakin/Download-App-Container/tree/master/backend/test) folder. File naming: `your_file_name.test.js`

**Routes, Api Throttle, Error Handling** see the file [middleware.js](https://github.com/alpernakin/Download-App-Container/blob/master/backend/middleware.js)

### Current Routes:

1. `/api/download/getInBounds?bl_lng=5&bl_lat=2&tr_lng=8&tr_lat=2&startDate=1577889314000&endDate=1580135714000`. 
   - Optional query params: `startDate` and `endDate`
2. `/api/download/getMonthly?year=2019`
3. `/api/download/getByCountry`
4. `/api/download/getByTimeOfDay`
## Data Producer

The data-producer is a simple program for data insertion into our MongoDB database. It also helps a lot to test real-time data streaming.
It inserts single or batch (randomly generated) data in the given interval and number on [app.config.js](https://github.com/alpernakin/Download-App-Container/blob/master/data-producer/assets/app.config.js) file.
There is also an option to manually insert single data on the config file.

## Frontend

The mobile application has been developed with the techstack: **[Ionic](https://ionicframework.com/getting-started), [Angular 8](https://angular.io/), [SocketIOClient](https://socket.io/docs/client-api/), [Jasmine](https://jasmine.github.io/), [Karma](https://angular.io/guide/testing), [Leaflet](https://leafletjs.com/), [Turf](https://turfjs.org/), [ChartJs](https://www.chartjs.org/)**

### Map Behaviour

The map behaviour considers that the database may store **big data**. 
Therefore, the cases have been implemented regarding the overloading issues. 

### Data Loading Cases

1. The map initializes and then the map page requests data for the specified parameters: map box (bounds) and period (start and end dates).
The API returns the download data in the map bounds and dates to avoid loading enourmous amount of data.
   - The map page remembers the lastly queried parameters and does not fetch data for the same parameters.
     - When the user gets out of the last queried map bounds; the page creates a new request event.
     - When the user changes the start and end dates; the page creates a new request event.
     - The events are queued and debounced in case of multiple conflicting requests. The last request event is taken into consideration.
     

2. The map page constantly listens the socket that streams real-time download data since the beginning.
If the streamed data meets the requirements (date-time filter), it adds them on the map. While loading data from the service, it ignores to add the streamed data to prevent duplicates.

### Marker Cluster

The download markers are clustered with [marker cluster](https://github.com/Leaflet/Leaflet.markercluster) to have clearer view on the map.

1. On zoom in: the clusters are splitted into the markers.
2. On zoom out: the markers are clustered into cluster markers.

###### Note: Start and end dates can be set to null by clicking **Cancel** button. It means that lower or higher date restrictions are not considered for null dates.

# Future Work

On the backend, the socket clients can be classified depending on the client necessity to stream only relevant data. It currently streams all new data.

The rest of the future work can be found by **todo** keyword on the project files.

