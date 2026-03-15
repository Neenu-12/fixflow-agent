import json
import boto3
from decimal import Decimal  

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ci_failures")

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert to int if whole number, else float
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)

def lambda_handler(event, context):
    try:
        params = event.get("queryStringParameters", {})
        status = params.get("status")
        failure_id = params.get("failure_id")
        
        if failure_id:
            response = table.get_item(
                Key={
                    "failure_id": failure_id
                }
            )

            item = response.get("Item")

            if not item:
                return {
                    "statusCode": 404,
                    "body": json.dumps({"message": "Item not found"})
                }

            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps(item, cls=DecimalEncoder)
              }

        if not status:
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "message": "status query parameter is required"
                })
            }

        response = table.query(
            IndexName="status-index",
            KeyConditionExpression="#s = :val",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":val": status}
        )

        items = response.get("Items", [])
        print("Items:", items)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(items, cls=DecimalEncoder)
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Internal server error",
                "error": str(e)
            })
        }
