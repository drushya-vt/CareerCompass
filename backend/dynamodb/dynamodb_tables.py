import boto3
from dotenv import load_dotenv
import os

load_dotenv()
dynamodb = boto3.client(
    "dynamodb",
    endpoint_url=os.getenv("DYNAMODB_ENDPOINT", "http://localhost:8000"),
    region_name=os.getenv("AWS_REGION", "us-east-2"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"), 
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)


def create_tables():
    # Users
    try:
        dynamodb.create_table(
            TableName="CS5934_G2_Users",
            KeySchema=[{"AttributeName": "username", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "username", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
            Tags=[{"Key": "Owner", "Value": "Drushya"}]
        )
    except dynamodb.exceptions.ResourceInUseException:
        pass

    # UserSessions
    try:
        dynamodb.create_table(
            TableName="CS5934_G2_UserSessions",
            KeySchema=[{"AttributeName": "username", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "username", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
            Tags=[{"Key": "Owner", "Value": "Drushya"}]
        )
    except dynamodb.exceptions.ResourceInUseException:
        pass

    # ChatHistories
    try:
        dynamodb.create_table(
            TableName="CS5934_G2_ChatHistories",
            KeySchema=[
                {"AttributeName": "chat_id", "KeyType": "HASH"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "chat_id", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"}
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "user_id-index",
                    "KeySchema": [
                        {"AttributeName": "user_id", "KeyType": "HASH"}
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                    "ProvisionedThroughput": {
                        "ReadCapacityUnits": 5,
                        "WriteCapacityUnits": 5
                    }
                }
            ],
            ProvisionedThroughput={
                "ReadCapacityUnits": 5,
                "WriteCapacityUnits": 5
            },
            Tags=[{"Key": "Owner", "Value": "Drushya"}]
        )
    except dynamodb.exceptions.ResourceInUseException:
        pass

    print("✅ Tables created.")



def verify_tables():
    tables = dynamodb.list_tables()
    print("🔍 Tables found:", tables.get("TableNames"))


# Table you want to inspect
table_name = "CS5934_G2_Users"

def parse_item(item):
    """Flatten DynamoDB types (e.g., {"S": "value"} → "value")"""
    return {k: list(v.values())[0] for k, v in item.items()}

def view_all_items():
    try:
        response = dynamodb.scan(TableName=table_name)
        items = response.get("Items", [])

        if not items:
            print(f"⚠️ No items found in table '{table_name}'")
        else:
            print(f"📄 Items in '{table_name}':")
            for item in items:
                print(parse_item(item))

    except dynamodb.exceptions.ResourceNotFoundException:
        print(f"❌ Table '{table_name}' does not exist.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_tables()
    verify_tables()
    view_all_items()