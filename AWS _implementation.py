# Lambda Function: Voice Processing
import boto3
import json
from elevenlabs import transcribe

def lambda_handler(event, context):
    # Receive voice input from frontend
    audio_data = event['audio']
    
    # Transcribe with ElevenLabs
    transcript = transcribe(audio_data)
    
    # Analyze sentiment with AWS Comprehend
    comprehend = boto3.client('comprehend')
    sentiment = comprehend.detect_sentiment(
        Text=transcript,
        LanguageCode='en'
    )
    
    # Classify issue type
    issue_type = classify_issue(transcript)
    
    # Enrich with Backboard context
    user_context = backboard.get_context(user_id)
    
    # Store in DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('CivicIssues')
    
    table.put_item(Item={
        'IssueID': generate_id(),
        'Transcript': transcript,
        'IssueType': issue_type,
        'Sentiment': sentiment['Sentiment'],
        'UserContext': user_context,
        'Timestamp': datetime.now().isoformat()
    })
    
    return {
        'statusCode': 200,
        'body': json.dumps('Issue reported successfully')
    }