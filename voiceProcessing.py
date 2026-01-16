import boto3
import json
from datetime import datetime
import os

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
comprehend = boto3.client('comprehend')
sns = boto3.client('sns')

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'CivicIssues')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', '')

def lambda_handler(event, context):
    """
    AWS Lambda function for processing voice input
    Integrates: ElevenLabs Speech-to-Text, AWS Comprehend, Backboard.io
    """
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        audio_data = body.get('audio')
        user_id = body.get('userId')
        transcript = body.get('transcript', '')  # Pre-transcribed by frontend
        
        print(f"Processing voice input for user: {user_id}")
        
        # If no transcript provided, transcribe audio
        # NOTE: In production, integrate with ElevenLabs API here
        if not transcript and audio_data:
            # transcript = elevenlabs_transcribe(audio_data)
            transcript = "Sample transcript: Large pothole on Princess Street"
        
        # Sentiment analysis with AWS Comprehend
        sentiment_response = comprehend.detect_sentiment(
            Text=transcript,
            LanguageCode='en'
        )
        
        sentiment = sentiment_response['Sentiment']
        sentiment_scores = sentiment_response['SentimentScore']
        
        print(f"Sentiment detected: {sentiment}")
        
        # Extract entities (locations, issue types)
        entities_response = comprehend.detect_entities(
            Text=transcript,
            LanguageCode='en'
        )
        
        entities = entities_response['Entities']
        location = extract_location(entities)
        
        # Classify issue type
        issue_type = classify_issue(transcript)
        
        # Calculate urgency based on sentiment and keywords
        urgency = calculate_urgency(sentiment, transcript, sentiment_scores)
        
        # TODO: In production, integrate Backboard.io for user context
        # user_context = fetch_backboard_context(user_id)
        
        # Store issue in DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        issue_id = f"ISSUE-{datetime.now().strftime('%Y%m%d%H%M%S')}-{user_id[:4]}"
        
        item = {
            'IssueID': issue_id,
            'UserID': user_id,
            'Transcript': transcript,
            'IssueType': issue_type,
            'Location': location,
            'Sentiment': sentiment,
            'SentimentScores': json.dumps(sentiment_scores),
            'Urgency': urgency,
            'Status': 'Pending',
            'Timestamp': datetime.now().isoformat(),
            'Reports': 1,
            'Entities': json.dumps([{
                'Type': e['Type'],
                'Text': e['Text'],
                'Score': e['Score']
            } for e in entities])
        }
        
        table.put_item(Item=item)
        print(f"Issue stored: {issue_id}")
        
        # Notify city via SNS (if configured)
        if SNS_TOPIC_ARN:
            try:
                sns.publish(
                    TopicArn=SNS_TOPIC_ARN,
                    Subject=f'New {issue_type} Report',
                    Message=f"""
New civic issue reported via CivicPulse AI:

Issue ID: {issue_id}
Type: {issue_type}
Location: {location}
Urgency: {urgency}
Description: {transcript}

Status: Pending Review
Reported: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                    """.strip()
                )
                print("SNS notification sent")
            except Exception as e:
                print(f"SNS notification failed: {str(e)}")
        
        # Return success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Issue reported successfully',
                'issueId': issue_id,
                'issueType': issue_type,
                'location': location,
                'urgency': urgency,
                'status': 'Pending',
                'estimatedResolution': calculate_estimated_resolution(issue_type, urgency)
            })
        }
        
    except Exception as e:
        print(f"Error processing voice input: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'message': 'Failed to process voice input'
            })
        }


def extract_location(entities):
    """Extract location from NLP entities"""
    locations = []
    
    for entity in entities:
        if entity['Type'] == 'LOCATION' and entity['Score'] > 0.7:
            locations.append(entity['Text'])
    
    if locations:
        return ', '.join(locations)
    
    return 'Location not specified'


def classify_issue(text):
    """
    Simple keyword-based issue classification
    In production, use ML model trained on historical data
    """
    text_lower = text.lower()
    
    keywords = {
        'Infrastructure - Pothole': ['pothole', 'road damage', 'pavement', 'crack', 'hole in road'],
        'Snow Removal': ['snow', 'ice', 'winter', 'plow', 'sidewalk clearing'],
        'Streetlight': ['streetlight', 'light out', 'lamp', 'lighting', 'dark street'],
        'Park Maintenance': ['park', 'playground', 'bench', 'grass', 'trail'],
        'Traffic Signal': ['traffic light', 'signal', 'intersection', 'crossing'],
        'Garbage Collection': ['garbage', 'trash', 'waste', 'recycling', 'collection'],
        'Water/Sewer': ['water', 'sewer', 'drain', 'flooding', 'leak'],
        'Public Safety': ['safety', 'danger', 'hazard', 'emergency']
    }
    
    for issue_type, keywords_list in keywords.items():
        for keyword in keywords_list:
            if keyword in text_lower:
                return issue_type
    
    return 'General Issue'


def calculate_urgency(sentiment, text, sentiment_scores):
    """
    Calculate urgency based on sentiment, keywords, and confidence
    Returns: 'low', 'medium', or 'high'
    """
    urgency_score = 0.0
    
    # Sentiment contribution (30%)
    if sentiment == 'NEGATIVE':
        urgency_score += 0.3 * sentiment_scores.get('Negative', 0)
    
    # Safety keywords (40%)
    safety_keywords = ['danger', 'unsafe', 'hazard', 'emergency', 'urgent', 'serious', 'major']
    text_lower = text.lower()
    
    for keyword in safety_keywords:
        if keyword in text_lower:
            urgency_score += 0.4
            break
    
    # Issue severity keywords (30%)
    severity_keywords = ['large', 'huge', 'massive', 'severe', 'critical', 'broken', 'damaged']
    
    for keyword in severity_keywords:
        if keyword in text_lower:
            urgency_score += 0.3
            break
    
    # Determine urgency level
    if urgency_score >= 0.6:
        return 'high'
    elif urgency_score >= 0.3:
        return 'medium'
    else:
        return 'low'


def calculate_estimated_resolution(issue_type, urgency):
    """
    Estimate resolution time based on historical data
    In production, use ML model for accurate predictions
    """
    base_times = {
        'Infrastructure - Pothole': 7,
        'Snow Removal': 2,
        'Streetlight': 5,
        'Park Maintenance': 10,
        'Traffic Signal': 3,
        'Garbage Collection': 1,
        'Water/Sewer': 4,
        'Public Safety': 1,
        'General Issue': 7
    }
    
    urgency_multipliers = {
        'high': 0.5,
        'medium': 1.0,
        'low': 1.5
    }
    
    base_days = base_times.get(issue_type, 7)
    multiplier = urgency_multipliers.get(urgency, 1.0)
    
    estimated_days = int(base_days * multiplier)
    
    return f"{estimated_days} days"