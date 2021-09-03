import json
import boto3

# import requests

ddb = boto3.resource("dynamodb")
portkeyTable = ddb.Table('Portkeys')

def build_return(code, message):
    print("Building return: "+message)
    return {
        "statusCode": code,
        "body": '{"message": "'+ message+'"}'
    }

def lambda_handler(event, context):
    print(event)
    mark = event['pathParameters']['mark']
    body = event['body']
    bodyjs = json.loads(body)
    destination = bodyjs['destination']
    bodymark = bodyjs['mark']
    if bodymark != mark:
        return build_return(400, "Mark must match in body and URL")
    ddbResponse = portkeyTable.put_item(
        Item={
            'Mark': mark,
            'Destination': destination
        }
    )
    ddbResponseCode = ddbResponse['ResponseMetadata']['HTTPStatusCode']
    if ddbResponseCode == 200:
        return build_return(200, "Mark saved")
    else:
        print(ddbResponseCode)
        print(ddbResponse)
        return build_return(500, "Error saving mark.")