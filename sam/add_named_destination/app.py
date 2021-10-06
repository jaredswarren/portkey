import json
import boto3
from jose import jwk, jwt
from jose.utils import base64url_decode
import urllib.request

region = 'us-east-1'
userpool_id = 'us-east-1_blKdYdznc'
keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format(region, userpool_id)

with urllib.request.urlopen(keys_url) as f:
  response = f.read()
keys = json.loads(response.decode('utf-8'))['keys']

ddb = boto3.resource("dynamodb")
portkeyTable = ddb.Table('Portkeys')

def build_return(code, message):
    print("Building return: "+message)
    return {
        "statusCode": code,
        "headers": {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*"
        },
        "body": '{"message": "'+ message+'"}'
    }

def verify_jwt(token):
    jwt_headers = jwt.get_unverified_headers(token)
    jwt_kid = jwt_headers['kid']
    key_index = -1
    for i in range(len(keys)):
        if jwt_kid == keys[i]['kid']:
            key_index = i
            break
    if key_index == -1:
        raise Exception("Public key not found in jwks")
        return build_return("503", "JWT fails validation.")
    public_key = jwk.construct(keys[key_index])
    message, encoded_signature = str(token).rsplit('.', 1)
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))
    if not public_key.verify(message.encode('utf-8'), decoded_signature):
        raise Exception("Unable to verify JWT token")
        return build_return("503", "JWT fails validation.")

    jwt_claims = jwt.get_unverified_claims(token)
    print("jwt headers")
    print(jwt_headers)
    print("jwt claims")
    print(jwt_claims)
    return jwt_claims

def set_destination(mark, destination, user, email):
    ddbResponse = portkeyTable.put_item(
        Item={
            'Mark': mark,
            'Destination': destination,
            "user": user,
            "email": email
        }
    )
    ddbResponseCode = ddbResponse['ResponseMetadata']['HTTPStatusCode']
    if ddbResponseCode == 200:
        return build_return(200, "Mark saved")
    else:
        print(ddbResponseCode)
        print(ddbResponse)
        return build_return(500, "Error saving mark")

def lambda_handler(event, context):
    print(event)
    token = event['headers']['Authorization']
    verified_jwt = verify_jwt(token)
    
    if 'cognito:groups' in verified_jwt:
        groups = verified_jwt['cognito:groups']
    else:
        groups = []

    mark = event['pathParameters']['mark']
    body = event['body']
    bodyjs = json.loads(body)
    destination = bodyjs['destination']

    user = verified_jwt['cognito:username']
    email = verified_jwt['email']
    
    bodymark = bodyjs['mark']
    if bodymark != mark:
        return build_return(400, "Portkey must match in body and URL")
    
    if not (destination.startswith('http://') or destination.startswith('https://')):
        return build_return(400, "Portkey must begin with http:// or https://")

    if 'PortkeyAdmins' in groups:
        return set_destination(mark, destination, user, email)

    ddbLoadResponse = portkeyTable.get_item(
        Key={
            "Mark": mark
        }
    )
    ddbRespCode = ddbLoadResponse['ResponseMetadata']['HTTPStatusCode']
    print(ddbLoadResponse)
    if ddbRespCode != 200:
        return build_return(500, "Error loading old mark")
    if ('Item' not in ddbLoadResponse) or (ddbLoadResponse['Item'] == None):
        return set_destination(mark, destination, user, email)
    elif ddbLoadResponse['Item']['user'] == user:
        return set_destination(mark, destination, user, email)
    elif ddbLoadResponse['Item']['user'] != user:
        return build_return(400, "This portkey already exists and is owned by another user.")