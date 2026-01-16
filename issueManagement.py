import boto3
import json
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
import os

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')

# Environment variables
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'CivicIssues')

def lambda_handler(event, context):
    """
    Handle CRUD operations for civic issues
    """
    
    try:
        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters', {})
        query_parameters = event.get('queryStringParameters', {}) or {}
        
        if http_method == 'GET':
            if path_parameters and 'issueId' in path_parameters:
                # Get single issue
                return get_issue(path_parameters['issueId'])
            else:
                # List all issues with filters
                return list_issues(query_parameters)
        
        elif http_method == 'PUT':
            # Update issue status
            body = json.loads(event.get('body', '{}'))
            return update_issue(path_parameters.get('issueId'), body)
        
        elif http_method == 'DELETE':
            # Delete issue (admin only)
            return delete_issue(path_parameters.get('issueId'))
        
        else:
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        print(f"Error in issue management: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }


def get_issue(issue_id):
    """Get a single issue by ID"""
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.get_item(Key={'IssueID': issue_id})
        
        if 'Item' in response:
            return {
                'statusCode': 200,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': True,
                    'issue': response['Item']
                }, default=str)
            }
        else:
            return {
                'statusCode': 404,
                'headers': get_cors_headers(),
                'body': json.dumps({
                    'success': False,
                    'error': 'Issue not found'
                })
            }
    except Exception as e:
        print(f"Error getting issue: {str(e)}")
        raise


def list_issues(filters):
    """
    List all issues with optional filters
    Supports: status, urgency, issueType, location
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        
        # Start with scan (in production, use GSI for better performance)
        scan_kwargs = {}
        
        # Build filter expression
        filter_expressions = []
        expression_values = {}
        
        if filters.get('status'):
            filter_expressions.append('Status = :status')
            expression_values[':status'] = filters['status']
        
        if filters.get('urgency'):
            filter_expressions.append('Urgency = :urgency')
            expression_values[':urgency'] = filters['urgency']
        
        if filters.get('issueType'):
            filter_expressions.append('contains(IssueType, :issueType)')
            expression_values[':issueType'] = filters['issueType']
        
        if filter_expressions:
            scan_kwargs['FilterExpression'] = ' AND '.join(filter_expressions)
            scan_kwargs['ExpressionAttributeValues'] = expression_values
        
        # Perform scan
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])
        
        # Sort by timestamp (most recent first)
        items.sort(key=lambda x: x.get('Timestamp', ''), reverse=True)
        
        # Pagination support
        limit = int(filters.get('limit', 100))
        items = items[:limit]
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'count': len(items),
                'issues': items
            }, default=str)
        }
        
    except Exception as e:
        print(f"Error listing issues: {str(e)}")
        raise


def update_issue(issue_id, updates):
    """Update an issue (typically status changes)"""
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        
        # Build update expression
        update_expr = "SET "
        expr_values = {}
        expr_names = {}
        
        allowed_fields = ['Status', 'Notes', 'AssignedTo', 'ResolutionDate']
        
        for i, (key, value) in enumerate(updates.items()):
            if key in allowed_fields:
                placeholder = f":val{i}"
                name_placeholder = f"#field{i}"
                
                if i > 0:
                    update_expr += ", "
                
                update_expr += f"{name_placeholder} = {placeholder}"
                expr_values[placeholder] = value
                expr_names[name_placeholder] = key
        
        # Add UpdatedAt timestamp
        update_expr += ", #updatedAt = :updatedAt"
        expr_values[':updatedAt'] = datetime.now().isoformat()
        expr_names['#updatedAt'] = 'UpdatedAt'
        
        response = table.update_item(
            Key={'IssueID': issue_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names,
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Issue updated successfully',
                'issue': response['Attributes']
            }, default=str)
        }
        
    except Exception as e:
        print(f"Error updating issue: {str(e)}")
        raise


def delete_issue(issue_id):
    """Delete an issue (admin only)"""
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        
        table.delete_item(Key={'IssueID': issue_id})
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Issue deleted successfully'
            })
        }
        
    except Exception as e:
        print(f"Error deleting issue: {str(e)}")
        raise


def get_cors_headers():
    """Return CORS headers for API responses"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }