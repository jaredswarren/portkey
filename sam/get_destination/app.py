import json

import boto3

ddb = boto3.resource("dynamodb")
portkeyTable = ddb.Table('Portkeys')

# import requests
def build_return(code, message, url=None):
    print("Building return: "+message)
    if url == None:
        return {
            "statusCode": code,
            "body": '{"message": "'+ message+'"}'
        }
    else:
        return {
            "statusCode": code,
            "body": '{"message": "'+ message+'"}',
            "headers": {
                "Location": url
            }
        }

def lambda_handler(event, context):

    mark = event['pathParameters']['mark']

    ddbResponse = portkeyTable.get_item(
        Key={'Mark': mark}        
    )

    print(ddbResponse)

    ddbResponseCode = ddbResponse['ResponseMetadata']['HTTPStatusCode']
    
    if 'Item' in ddbResponse:    
        url = ddbResponse['Item']['Destination']
        if ddbResponseCode == 200:
            return build_return(301, "Redirect", url=url)
    else:
        return build_return(400, "No such mark: "+mark)
