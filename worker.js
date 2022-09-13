var Rascal = require('rascal');
var config = require('./worker.json');

async function rascal_worker() {
	try {
		const broker = await Rascal.BrokerAsPromised.create(Rascal.withDefaultConfig(config));
		broker.on('error', console.error);

		try {
			const subscription = await broker.subscribe('sub_workers');
			subscription
				.on('message', function (message, content, ackOrNack) {
					console.log("Got message:" + content);
					console.log("ReplyTo:" + message.properties.replyTo);
					console.log("ReplyId:" + message.properties.correlationId);

					broker.publish('/', { msg: 'PROCESSED FOR ' + message.properties.replyTo }, {
						routingKey: message.properties.replyTo,
						options: {
							correlationId: message.properties.correlationId
						}
					});
					ackOrNack();
				})
				.on('error', console.error);

			console.log("checking:" + JSON.stringify(subscription));
		} catch (err) {
			console.error(err);
		}
	} catch (err) {
		console.error(err);
	}
}

async function main() {
	rascal_worker();

	console.log("end");
}
main();