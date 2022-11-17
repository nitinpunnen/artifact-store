import json
import boto3
import pprint
import logging
from botocore.exceptions import ClientError

kendra = boto3.client("kendra")


def handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    query = event["queryStringParameters"]["query"]
    print("Divia Query is " + query)
    response = search_kendra(query)

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(response)
    }


def search_kendra(query):
    # Provide the index ID
    index_id = "297e2f07-5a3c-4a6f-a127-47abb46cac36"

    result = kendra.query(
        QueryText=query,
        IndexId=index_id)

    for resultItem in result['ResultItems']:
        documentId = resultItem["DocumentId"]
        print("Nitin documentId is " + documentId)
        bucketName = 's3://npunnen-artifactstore-landingzone85342-dev'
        keyName = documentId.split(bucketName, 1)[1]
        print("Nitin keyName is " + keyName)
        preSignedUrl = create_presigned_url(bucketName, keyName)
        print("Nitin preSignedUrl is " + preSignedUrl)
        resultItem['PreSignedURL'] = preSignedUrl

    return result


def create_presigned_url(bucket_name, object_name, expiration=3600):
    # Generate a presigned URL for the S3 object
    s3_client = boto3.client('s3')
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
