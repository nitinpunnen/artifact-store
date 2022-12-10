import json
import boto3
import pprint
import logging
from botocore.exceptions import ClientError

kendra = boto3.client("kendra")


def handler(event, context):
    query = event["queryStringParameters"]["query"]
    attribute_filter = json.loads(event["queryStringParameters"]["attributeFilter"])
    # attribute_filter = event["queryStringParameters"]["attributeFilter"]
    response = search_kendra(query, attribute_filter)
    print(response)

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(response)
    }


def search_kendra(query, attribute_filter):
    # Provide the index ID
    index_id = "792dcbad-4ed1-4411-bf71-ec045e2f46d8"

    result = kendra.query(
        QueryText=query,
        IndexId=index_id,
        AttributeFilter=attribute_filter)

    # result = kendra.query(
    #     QueryText=query,
    #     IndexId=index_id)

    for resultItem in result['ResultItems']:
        response = getS3DocumentId(resultItem)
        document_id = response[0]
        is_s3_document = response[1]
        if is_s3_document:
            bucketName = 'npunnen-artifactstore-landingzone221642-dev'
            keyName = document_id.split(bucketName + '/', 1)[1]
            preSignedUrl = create_presigned_url(bucketName, keyName)
            resultItem['HrefUri'] = preSignedUrl
        else:
            resultItem['HrefUri'] = resultItem["DocumentURI"]

    return result


def getS3DocumentId(resultItem):
    for attribute in resultItem['DocumentAttributes']:
        if attribute['Key'] == 's3_document_id':
            # Return s3documentId and flag true since it is not a s3 document
            return attribute['Value']['StringValue'], True
    documentId = resultItem["DocumentId"]
    # Return documentId and flag false since it is not a s3 document
    return documentId, False


def create_presigned_url(bucket_name, object_name, expiration=3600):
    # Generate a presigned URL for the S3 object
    s3_client = boto3.client('s3', region_name="us-west-2", config=boto3.session.Config(signature_version='s3v4', ))
    try:
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': bucket_name,
                                                            'Key': object_name},
                                                    ExpiresIn=expiration)
    except ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return response
