var Rascal = require('rascal');
var config = require('./requester.json');

function getId() {
    return (Math.random() + 1).toString(36).substring(2);
}

const id = getId();

var subscription;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
    try {
        const broker = await Rascal.BrokerAsPromised.create(Rascal.withDefaultConfig(config));
        broker.on('error', console.error);

        try {
            subscription = await broker.subscribe('sub_logs');
            subscription
                .on('message', function (message, content, ackOrNack) {
                    console.log("Got message:" + content.msg);
                    console.log("with id:" + message.properties.correlationId);

                    //console.log("checking:" + JSON.stringify(message));
                    ackOrNack();
                })
                .on('error', console.error);
        
            //console.log("checking:" + JSON.stringify(subscription));
        } catch (err) {
            console.error(err);
	}

	setInterval(async function () {
	try {
                const publication = await broker.publish('pub_workers', new Date().toISOString() + `: message from "${id}"`, {
                    options: {
                        replyTo: subscription.config.source,
                        correlationId: getId() 
                    }
                });
                publication.on('error', console.error);
                
            } catch (err) {
                console.error(err);
            }
        }, 1000);

    } catch (err) {
        console.error(err);
    }
}
main();
