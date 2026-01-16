# CivicPulse AI - Technical Architecture

## System Overview

CivicPulse AI is built on a modern, serverless architecture that ensures scalability, reliability, and cost-effectiveness.

## Architecture Diagram

─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  React 18 + TailwindCSS + Vite (PWA-enabled)               │
│  - Voice Input Component (MediaRecorder API)                │
│  - Real-time Dashboard (WebSocket)                          │
│  - Geospatial Map (Leaflet/Mapbox)                         │
└──────────────────┬──────────────────────────────────────────┘
│
│ HTTPS/WSS
▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  AWS API Gateway (REST + WebSocket)                         │
│  - Authentication (Cognito)                                 │
│  - Rate Limiting                                            │
│  - Request Validation                                       │
└──────────────────┬──────────────────────────────────────────┘
│
│
┌───────────┴───────────┬───────────────────┐
▼                       ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Lambda    │      │   Lambda    │      │   Lambda    │
│   Voice     │      │   Issue     │      │ Analytics   │
│ Processing  │      │ Management  │      │   Engine    │
└─────┬───────┘      └──────┬──────┘      └──────┬──────┘
│                     │                     │
│                     │                     │
▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  DynamoDB    │  │  S3 Bucket   │  │ SageMaker   │      │
│  │  Issues DB   │  │  Voice Files │  │ ML Models   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
│                     │                     │
└─────────────────────┴─────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ElevenLabs   │  │ Backboard.io │  │    AWS       │      │
│  │ Voice API    │  │   Context    │  │ Comprehend   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
## Component Details

### Frontend (React + Vite)
- **Framework:** React 18 with functional components and hooks
- **Styling:** TailwindCSS for utility-first styling
- **Build Tool:** Vite for fast development and optimized builds
- **PWA:** Service worker for offline capability
- **State Management:** React Context + useState hooks
- **Voice Input:** MediaRecorder API for audio capture

### Backend (AWS Lambda)

#### 1. Voice Processing Function
- **Runtime:** Python 3.9
- **Memory:** 512 MB
- **Timeout:** 30 seconds
- **Triggers:** API Gateway POST /process-voice

**Flow:**
1. Receive audio data from frontend
2. Transcribe with ElevenLabs API
3. Analyze sentiment with AWS Comprehend
4. Extract entities (location, urgency)
5. Fetch user context from Backboard.io
6. Store in DynamoDB
7. Notify city via SNS
8. Return confirmation to user

#### 2. Issue Management Function
- **Runtime:** Python 3.9
- **Memory:** 256 MB
- **Timeout:** 10 seconds
- **Triggers:** API Gateway GET/PUT/DELETE /issues

**Operations:**
- GET /issues - List all issues (with filters)
- GET /issues/{id} - Get single issue
- PUT /issues/{id} - Update issue status
- DELETE /issues/{id} - Delete issue (admin)

#### 3. Analytics Engine Function
- **Runtime:** Python 3.9
- **Memory:** 1024 MB
- **Timeout:** 60 seconds
- **Triggers:** DynamoDB Stream, Scheduled (EventBridge)

**Functions:**
- Aggregate issue statistics
- Calculate resolution time predictions
- Generate trend analysis
- Optimize resource allocation

### Data Storage

#### DynamoDB Table Schema

CivicIssues Table:
├── IssueID (Partition Key, String) - e.g., "ISSUE-20260116123045-user"
├── UserID (String) - User identifier
├── Transcript (String) - Voice transcription
├── IssueType (String) - Classified category
├── Location (String) - Extracted location
├── Sentiment (String) - POSITIVE|NEGATIVE|NEUTRAL|MIXED
├── SentimentScores (JSON) - Detailed scores
├── Urgency (String) - low|medium|high
├── Status (String) - Pending|In Progress|Resolved
├── Timestamp (String, ISO 8601)
├── Reports (Number) - Count of similar reports
├── Entities (JSON) - NLP extracted entities
├── UpdatedAt (String) - Last update timestamp
└── ResolutionDate (String, Optional)

#### Global Secondary Indexes (GSI)
- **StatusIndex:** Status (PK), Timestamp (SK) - For filtering by status
- **UrgencyIndex:** Urgency (PK), Timestamp (SK) - For filtering by urgency
- **LocationIndex:** Location (PK), Timestamp (SK) - For geospatial queries

### External Integrations

#### 1. ElevenLabs Voice AI
- **Purpose:** Speech-to-Text transcription
- **Endpoint:** https://api.elevenlabs.io/v1/speech-to-text
- **Features:** 29 languages, noise cancellation, speaker identification

#### 2. Backboard.io Context Memory
- **Purpose:** User context and personalization
- **Features:** 
  - Store user reporting history
  - Learn location preferences
  - Track engagement patterns
  - Predictive recommendations

#### 3. AWS Comprehend
- **Purpose:** Natural Language Processing
- **Features:**
  - Sentiment analysis
  - Entity extraction (locations, organizations)
  - Key phrase detection
  - Language detection

## Security

### Authentication & Authorization
- AWS Cognito for user authentication
- JWT tokens for API access
- Role-based access control (RBAC)

### Data Protection
- Encryption at rest (DynamoDB, S3)
- Encryption in transit (TLS 1.3)
- Voice data deleted after transcription (< 5 seconds)
- Location data anonymized (intersection-level)

### API Security
- Rate limiting (1000 requests/hour per user)
- Request validation
- CORS configuration
- API key authentication for admin endpoints

## Scalability

### Auto-Scaling Components
- **Lambda:** Auto-scales to 1000 concurrent executions
- **DynamoDB:** On-demand billing, auto-scales
- **API Gateway:** Handles 10,000 requests/second
- **CloudFront CDN:** Global edge caching

### Performance Optimizations
- Lambda provisioned concurrency for cold start reduction
- DynamoDB DAX for caching
- ElastiCache for session storage
- CloudFront for static asset delivery

## Monitoring & Logging

### CloudWatch Integration
- Lambda function metrics (invocations, errors, duration)
- DynamoDB metrics (read/write capacity, throttles)
- API Gateway metrics (latency, 4xx/5xx errors)
- Custom application metrics

### Alerts
- High error rate (> 5%)
- High latency (> 3 seconds)
- DynamoDB throttling
- Lambda function failures

## Cost Estimation

### Monthly Costs (10,000 users, 50,000 reports/month)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 150K invocations, 512MB, 5s avg | $12 |
| DynamoDB | 50K writes, 500K reads | $8 |
| API Gateway | 150K requests | $0.50 |
| S3 | 1GB storage, 10K requests | $0.10 |
| CloudWatch | Logs + Metrics | $5 |
| ElevenLabs | 50K transcriptions | $25 |
| Backboard.io | 10K users | $100 |
| **Total** | | **~$150/month** |

**Per User Cost:** $0.015/month ($0.18/year)

## Deployment

### CI/CD Pipeline

GitHub Push
→ GitHub Actions
→ Run Tests
→ Build Frontend (npm run build)
→ Deploy Frontend to S3/CloudFront
→ Package Backend (Serverless Framework)
→ Deploy Backend to AWS Lambda
→ Run Integration Tests
→ Send Slack Notification

### Environment Stages
- **dev:** Development environment
- **staging:** Pre-production testing
- **prod:** Production environment

## Disaster Recovery

### Backup Strategy
- DynamoDB Point-in-Time Recovery (PITR) enabled
- Daily snapshots to S3
- Cross-region replication for critical data
- Recovery Time Objective (RTO): < 1 hour
- Recovery Point Objective (RPO): < 5 minutes

## Future Enhancements

### Phase 2 Features
- Real-time WebSocket notifications
- GraphQL API
- Mobile native apps (React Native)
- Advanced ML models (custom trained on Kingston data)
- Integration with city's existing 311 system

### Phase 3 Scaling
- Multi-tenant architecture for other municipalities
- White-label solution
- Advanced analytics dashboard for city officials
- Public API for third-party developers