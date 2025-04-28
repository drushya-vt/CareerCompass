import boto3
import datetime
from uuid import uuid4
import bcrypt
import os
from boto3.dynamodb.conditions import Key
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv()

# Initialize DynamoDB
dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.getenv("AWS_REGION", "us-east-2"),
    endpoint_url=os.getenv("DYNAMODB_ENDPOINT", "http://localhost:8000")  # Only set for local
)

# Tables
users_table = dynamodb.Table("G2_Users")
session_table = dynamodb.Table("G2_UserSessions")
chat_table = dynamodb.Table("G2_ChatHistories")


# ===== User Account Handling =====

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_user(username: str, email: str, password: str):
    users_table.put_item(Item={
        "username": username,
        "email": email,
        "password": hash_password(password),
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

def get_user(username: str):
    response = users_table.get_item(Key={"username": username})
    return response.get("Item")

# ===== Session Logging =====

def save_session_login(username: str):
    session_table.put_item(Item={
        "username": username,
        "login_time": datetime.datetime.now(datetime.timezone.utc).isoformat()
    })

def save_session_logout(username: str):
    session_table.update_item(
        Key={"username": username},
        UpdateExpression="SET logout_time = :lt",
        ExpressionAttributeValues={":lt": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    )

# ===== Chat History =====

def save_chat_history(user_id: str, history_data):
    chat_id = str(uuid4())
    chat_table.put_item(Item={
        "chat_id": chat_id,
        "user_id": user_id,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "history": history_data
    })
    return chat_id



def get_chat_history(user_id: str, chat_id: str):
    try:
        response = chat_table.get_item(
            Key={'chat_id': chat_id}
        )
        item = response.get('Item')
        if not item:
            return None
        
        # 🛡️ Protect: Check if the chat really belongs to the requesting user
        if item.get('user_id') != user_id:
            raise Exception("Chat does not belong to the user.")

        return {
            "chat_id": item["chat_id"],
            "history": item["history"],
            "timestamp": item.get("timestamp", "")
        }
    except ClientError as e:
        print(f"Error getting chat history: {e}")
        return None
    except Exception as e:
        print(f"Access denied or other error: {e}")
        return None


def get_user_chat_histories(user_id: str):
    try:
        response = chat_table.query(
            IndexName="user_id-index",  # 🛑 Important! Query the correct index
            KeyConditionExpression=Key('user_id').eq(user_id),
            ScanIndexForward=False  # 🔥 Optional: latest chats first
        )
        items = response.get('Items', [])
        return [
            {
                "chat_id": item["chat_id"],
                "timestamp": item.get("timestamp", "")
            }
            for item in items
        ]
    except ClientError as e:
        print(f"Error getting user chat histories: {e}")
        return []
