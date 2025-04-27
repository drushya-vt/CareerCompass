import boto3
import datetime
from uuid import uuid4
import bcrypt
import os
from boto3.dynamodb.conditions import Key
from dotenv import load_dotenv
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

def get_chat_history(user_id: str = None, chat_id: str = None):
    if chat_id:
        response = chat_table.get_item(Key={"chat_id": chat_id})
        return response.get("Item")
    if user_id:
        response = chat_table.query(
            IndexName="user_id-index",
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        return response.get("Items", [])
    raise ValueError("Must provide either user_id or chat_id")