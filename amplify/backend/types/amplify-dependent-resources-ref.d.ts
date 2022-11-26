export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "artifactstoreb96ea463": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "api": {
        "uploadFiles": {
            "GraphQLAPIKeyOutput": "string",
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        },
        "kendraSearch": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "neptuneSearch": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "UploadedFilesAPI": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    },
    "storage": {
        "landingZone": {
            "BucketName": "string",
            "Region": "string"
        }
    },
    "function": {
        "artifactStoreKendraSearch": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "artifactStoreNeptuneSearch": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "artifactstoreListFiles": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    }
}