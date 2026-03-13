import json
import boto3
import time

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ci_failures")

def lambda_handler(event, context):
    response = table.query(
        IndexName="status-index",
        KeyConditionExpression="#s = :val",
        ExpressionAttributeNames={
            "#s": "status"
        },
        ExpressionAttributeValues={
            ":val": "pending_approval"
        }
    )

    items = response["Items"]
    
    return {
        "statusCode": 200,
        "data": items
    }
