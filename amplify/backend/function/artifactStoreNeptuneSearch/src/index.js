const gremlin = require('gremlin');

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const { DriverRemoteConnection } = gremlin.driver;
    const { Graph } = gremlin.structure;
    const endpoint = process.env.NEPTUNE_CLUSTER_ENDPOINT;
    const port = process.env.NEPTUNE_PORT;
    // Use wss:// for secure connections. See https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-ssl.html
    const dc = new DriverRemoteConnection(
        `wss://${process.env.NEPTUNE_CLUSTER_ENDPOINT}:${process.env.NEPTUNE_PORT}/gremlin`, { mimeType: 'application/vnd.gremlin-v2.0+json' }
    );
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);
    const withTokens = '~tinkerpop.valueMap.tokens';

    try {
        let data = [];
        console.log('Divia ', event)
        const {
            query
        } = event.queryStringParameters || {};
        console.log("query is ", query);

        // Get the searched object into first array item
        const searchedNode = await g.V()
            .has('name', query)
            .valueMap()
            .with_(withTokens)
            .toList();
        data.push(searchedNode[0]);

        const nodes = await g.V()
            .has('name', query).both()
            .valueMap()
            .with_(withTokens)
            .toList();

        const relations = await g.V()
            .has('name', query).bothE()
            .valueMap()
            .with_(withTokens)
            .toList();

        nodes.forEach((element, index) => {
            element.relationship = relations[index].label;
            data.push(element);
        });

        // relations.forEach(element => data.push(element));

        console.log("data is ", data);

        dc.close();
        return formatResponse(data);
    }
    catch (error) {
        console.log('ERROR', error);
        dc.close();
    }
};

const formatResponse = payload => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Max-Age': 2592000, // 30 days
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    };
};
