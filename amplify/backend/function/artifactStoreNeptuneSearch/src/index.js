const gremlin = require('gremlin');
const {DriverRemoteConnection} = gremlin.driver;
const {Graph} = gremlin.structure;
const endpoint = process.env.NEPTUNE_CLUSTER_ENDPOINT;
const port = process.env.NEPTUNE_PORT;
// Use wss:// for secure connections. See https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-ssl.html
const dc = new DriverRemoteConnection(
    `wss://${process.env.NEPTUNE_CLUSTER_ENDPOINT}:${process.env.NEPTUNE_PORT}/gremlin`, {mimeType: 'application/vnd.gremlin-v2.0+json'}
);
const graph = new Graph();
const g = graph.traversal().withRemote(dc);
const withTokens = '~tinkerpop.valueMap.tokens';

const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const {S3Client, GetObjectCommand} = require("@aws-sdk/client-s3");

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);

    try {
        let data = [];
        console.log('Divia ', event)
        const {
            entity,
            level
        } = event.queryStringParameters || {};
        console.log("entity is ", entity);

        // Get the searched object into first array item
        const searchedNode = await g.V()
            .has('name', entity)
            .valueMap()
            .with_(withTokens)
            .toList();
        data.push(searchedNode[0]);

        //If label is a Document or a Drawing, get a Presigned URL
        console.log(searchedNode);
        console.log(searchedNode[0]['label']);
        if (searchedNode[0]['label'] === 'document' || searchedNode[0]['label'] === 'drawing') {
            const s3Bucket = searchedNode[0]['s3Bucket'][0];
            const s3Key = searchedNode[0]['s3Key'][0];
            console.log(s3Bucket);
            console.log(s3Key);

            const getParams = {
                Bucket: s3Bucket,
                Key: s3Key
            }
            const client = new S3Client({region: "us-west-2"});
            const command = new GetObjectCommand(getParams);
            const url = await getSignedUrl(client, command, {expiresIn: 3600});
            console.log(url)
            searchedNode[0]['PreSignedURL'] = url;
        }

        const nodes = await g.V()
            .has('name', entity).both()
            .valueMap()
            .with_(withTokens)
            .toList();

        const relations = await g.V()
            .has('name', entity).bothE()
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
    } catch (error) {
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
