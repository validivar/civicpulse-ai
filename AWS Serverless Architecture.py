# Lambda Function: Voice Processing Pipeline
def lambda_handler(event, context):
    # Step 1: Receive voice data
    audio_data = event['audio']
    user_id = event['userId']
    
    # Step 2: Transcribe with ElevenLabs
    transcript = elevenlabs.transcribe(audio_data)
    
    # Step 3: NLP with AWS Comprehend
    comprehend = boto3.client('comprehend')
    
    # Sentiment analysis
    sentiment = comprehend.detect_sentiment(
        Text=transcript,
        LanguageCode='en'
    )
    
    # Entity extraction (locations, issue types)
    entities = comprehend.detect_entities(
        Text=transcript,
        LanguageCode='en'
    )
    
    # Step 4: Enrich with Backboard.io context
    user_context = backboard.get_context(user_id)
    # Returns: previous reports, preferred district, issue interests
    
    # Step 5: Classify issue type using custom model
    issue_type = classify_issue(transcript, user_context)
    
    # Step 6: Store in DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('CivicIssues')
    
    issue_id = generate_unique_id()
    
    table.put_item(Item={
        'IssueID': issue_id,
        'UserID': user_id,
        'Transcript': transcript,
        'IssueType': issue_type,
        'Location': extract_location(entities),
        'Sentiment': sentiment['Sentiment'],
        'Status': 'Pending',
        'Urgency': calculate_urgency(sentiment, user_context),
        'Timestamp': datetime.now().isoformat()
    })
    
    # Step 7: Notify city via SNS
    sns = boto3.client('sns')
    sns.publish(
        TopicArn='arn:aws:sns:us-east-1:xxx:CivicAlerts',
        Message=f"New {issue_type} reported at {location}",
        Subject='CivicPulse Alert'
    )
    
    return {'statusCode': 200, 'issueId': issue_id}