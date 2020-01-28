import mongoose from "mongoose";
import config from "../app.config";

class Connection {

	constructor() {
		mongoose.Promise = global.Promise;
		mongoose.set("useNewUrlParser", true);
		mongoose.set("useFindAndModify", false);
		mongoose.set("useCreateIndex", true);
		mongoose.set("useUnifiedTopology", true);

		let host = `${config.mongoDb.host}:${config.mongoDb.port}`;
		this.connectionString = `mongodb://${host}/${config.mongoDb.database}`;

		var db = mongoose.connection;

		db.on('error', console.error.bind(console, 'connection error:'));
		mongoose.connect(this.connectionString).catch((err) => {
			// TODO use logger to log the error!
			throw new Error('The server could not connect to the MongoDB!');
		});

		// successfully connected
		mongoose.connection.on('connected', () => {
			console.log('[Mongoose Connection] ' + this.connectionString);
		});
		// if the connection throws an error
		mongoose.connection.on('error', (err) => {
			console.log('[Mongoose Connection Error] ' + err);
			// TODO use logger to log the error!
			throw new Error('Mongoose connection error!');
		});
		// the connection is disconnected
		mongoose.connection.on('disconnected', () => {
			console.log('Mongoose default connection disconnected');
		});
		// if the Node process ends, close the Mongoose connection 
		process.on('SIGINT', function () {
			mongoose.connection.close(() => {
				console.log('Mongoose default connection disconnected through app termination');
				process.exit(0);
			});
		});
	}
}
// since the Connection pool is managed by mongoose for multiple queries
// the mongodb connection should be created once for the sake of connection pooling
// http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect
export default new Connection();