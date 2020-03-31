# Download-App-Container

Real-time and historical **download** data represantation. There are two major components for representation: map & statistics.

**Frontend**: A mobile application, implemented with Ionic, Angular, Jasmine, Karma. The application represents real-time and historical download points on a map, and shows example statistics comparisons.

**Backend**: API, implemented with ExpressJ, Mongoose, Socket.io, Chai and Mocha. The API serves the download points and streams them. Besides that, it serves some statistics data.

**Data-Producer**: Feeds the Mongo database with dummy data. This app is well important for testing real-time data streaming.

# Installation

## Docker

**Important** Before the installation, please configure the host info for MongoDB connections on data-producer and backend projects. The host must be set to 'mongo'.

Please see the [app.config.js](https://github.com/alpernakin/Download-App-Container/blob/master/backend/app.config.js) for backend mongo configuration.
Please see the [app.config.js](https://github.com/alpernakin/Download-App-Container/blob/master/data-producer/app.config.js) for data-producer mongo configuration.

1. On the Download-App-Container directory, open shell and command: ```docker-compose --build```
   - Recommended to see the data-producer configuration before running the script to configure data insertion options based on your needs.
   
2. Wait until five containers are built: mongo, replica_setup, data_producer, backend, frontend
   
3. Please see the running app on the url ```http://localhost:4200```

For details please see [docker-compose.yml](https://github.com/alpernakin/Download-App-Container/blob/master/docker-compose.yml)

## Manual

**Important** Before the installation, please configure the host info for MongoDB connections on data-producer and backend projects. The host must be set to 'localhost'.

Please see the [app.config file](https://github.com/alpernakin/Download-App-Container/blob/master/backend/app.config.js) for **backend** mongo configuration.
Please see the [app.config file](https://github.com/alpernakin/Download-App-Container/blob/master/data-producer/app.config.js) for **data-producer** mongo configuration.

### Backend

#### MongoDB

Please [download MongoDB](https://www.mongodb.com/download-center/community). It will install the MongoDB server on the port 27017 by default (you can change it by setting a new port on [app.config file](https://github.com/alpernakin/Download-App-Container/blob/master/backend/app.config.js))

For real-time data streaming, MongoDB [change streams](https://docs.mongodb.com/manual/changeStreams/) require replica sets, therefore we set up replicas, please follow the instructions:

[See original replica set installation instructions](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)

1. Shut down any running [Mongod service](https://docs.mongodb.com/manual/reference/program/mongod/#bin.mongod) (it can be stopped on services)

2. Command prompt on the MongoDB directory your_mongodb_dir/Server/your_mongodb_version/bin
   - Start a new mongod instance with --replSet, --dbPath and --port configuration.
   - **Important** Please create the --dbPath directory in advance.
   - Example command: ```mongod --port 27017 --dbpath ../data/db0 --replSet rs0 --bind_ip 127.0.0.1```
   
3. Connect to a mongo shell: mongo.exe under your_mongodb_dir/Server/your_mongodb_version/bin
   - Initiate the replica set with the command: ```rs.initiate()```
   - See status and configuration with the commands: ```rs.conf()```, ```rs.status()```

#### Server

[Please install NodeJs.](https://nodejs.org/en/download/)

Firstly command ```npm install``` to load node_modules on the backend directory

Then:

1. ```npm run start```
2. ```npm run test```
   - The tests are independent from other apps.

### Frontend

[Please install NodeJs.](https://nodejs.org/en/download/)

Firstly command ```npm install``` to load node_modules on the frontend directory

Then:

1. ```npm run start```
2. ```npm run test```
   - The tests are independent from other apps.

###### Note: If the first test is interrupted by uncaught dummy error, please try again.

### Data-Producer

Firstly command ```npm install``` to load node_modules on the data-producer directory

Then: ```npm run start```

###### Configuration: The data production and insertion options are on the [app.config.js file](https://github.com/alpernakin/Download-App-Container/blob/master/data-producer/app.config.js)

# Documentation

## Backend

The API server has been developed with the techstack: **[ExpressJs](https://expressjs.com/), [Socket.IO](https://socket.io/), [Mongoose (ODM)](https://mongoosejs.com/), [Chai](https://www.chaijs.com/), [Mocha](https://mochajs.org/), [TestDouble](https://github.com/testdouble/testdouble.js)**

For **mongoDB schema and indexes** see the [download.schema file](https://github.com/alpernakin/Download-App-Container/blob/master/backend/mongodb/download.schema.js)

For **unit testing**, please see the files under [test folder](https://github.com/alpernakin/Download-App-Container/tree/master/backend/test) folder. File naming: `<your_file_name>.test.js`.

### API Routes:

1. `/api/download/getInBounds?bl_lng=5&bl_lat=2&tr_lng=8&tr_lat=2&startDate=1577889314000&endDate=1580135714000`.
   - **bl_lng** bottom-left longitude, *number*, *required*
   - **bl_lat** bottom-left latitude, *number*, *required*
   - **tr_lng** top-right longitude, *number*, *required*
   - **tr_lat** top-right latitude, *number*, *required*
   - **startDate** minimum download date in milliseconds, *number*, *optional*
   - **endDate** maximum download date in milliseconds, *number*, *optional*
2. `/api/download/getMonthly?year=2019`
   - **year** months of the year, *number*, *required*
3. `/api/download/getByCountry`
4. `/api/download/getByTimeOfDay`

## Data Producer

The data-producer is a simple program for data insertion into our MongoDB database. It also helps a lot to test real-time data streaming.
It inserts single or batch (randomly generated) data in the given interval and number on [app.config.js](https://github.com/alpernakin/Download-App-Container/blob/master/data-producer/assets/app.config.js) file.
There is also an option to manually insert single data on the config file.

## Frontend

The mobile application has been developed with the techstack: **[Ionic](https://ionicframework.com/getting-started), [Angular 8](https://angular.io/), [SocketIOClient](https://socket.io/docs/client-api/), [Jasmine](https://jasmine.github.io/), [Karma](https://angular.io/guide/testing), [Leaflet](https://leafletjs.com/), [TurfJs](https://turfjs.org/), [ChartJs](https://www.chartjs.org/)**

### Map Behaviour

The map behaviour considers that the database may store **big data**. The map page has been tested with 16.7 millions of download data in two years of period. Therefore, the cases have been implemented regarding the overloading issues. 

### Data Loading Cases

1. The map initializes and then the map page requests data for the specified parameters: map box (bounds) and period (start and end dates).
The API returns the download data in the map bounds ([see Mongo Geospatial](https://docs.mongodb.com/manual/reference/operator/query-geospatial/)) and dates to avoid loading enourmous amount of data.
   - The map page remembers the lastly queried parameters and does not fetch data for the same parameters.
     - When the user gets out of the last queried map bounds; the page creates a new request event.
       - The previous and current map bounds are compared by [TurfJs](https://turfjs.org/) on the client-side.
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

The map restrictions can be enhanced depending on the expected amount of data. It would be heavy for approx. 1-2 years of period with over 15 millions of data.

The rest of the future work can be found by **todo** keyword on the project files.

