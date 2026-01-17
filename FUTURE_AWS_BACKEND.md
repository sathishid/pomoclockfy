# Future AWS Backend Development Plan

## 📋 Overview

This document outlines the planned backend architecture for Pomoclockfy using AWS services. This is a future enhancement to move from browser session storage to a cloud-backed solution.

**Status**: Planning Phase  
**Cost Estimate**: ₹200-500/month  
**Target Users**: 2 friends (easily scalable to more)

---

## 🏗️ Architecture Overview

```
Frontend (React)
     ↓
API Gateway (REST API)
     ↓
Lambda Functions (Serverless Compute)
     ↓
DynamoDB (NoSQL Database)
```

### Technology Stack
- **Compute**: AWS Lambda (Node.js or Python)
- **API**: AWS API Gateway
- **Database**: AWS DynamoDB (NoSQL)
- **Authentication**: JWT Tokens (no Cognito needed)
- **Frontend**: Existing React app (minimal changes)

---

## 🔐 Authentication Strategy: JWT

### Why JWT?
- ✅ Lightweight and stateless
- ✅ No additional AWS service needed (free)
- ✅ Industry standard
- ✅ Secure for 2 trusted users
- ✅ Good learning experience

### JWT Flow
```
1. User Login
   Frontend → Lambda POST /auth/login (username, password)
   Lambda → Returns JWT token
   
2. Subsequent Requests
   Frontend → Includes token in headers (Authorization: Bearer <token>)
   Lambda → Verifies token
   DynamoDB → Processes authenticated request
```

### Implementation Details
- **Secret Key**: Store in AWS Secrets Manager or Lambda environment variables
- **Expiration**: 7-30 days (reasonable for personal app)
- **Refresh**: Optional, implement if needed

---

## 📊 DynamoDB Schema

### Users Table
```
PK: userId (String) - partition key
SK: metadata (String) - sort key

Attributes:
- username (String) - unique
- passwordHash (String) - bcrypt hashed
- createdAt (Number) - timestamp
- settings (Object) - work/break durations
  {
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15
  }
```

### Tasks Table
```
PK: userId (String) - partition key
SK: taskId#timestamp (String) - sort key

Attributes:
- taskName (String)
- sessionType (String) - 'work' | 'break' | 'longBreak'
- startTime (Number) - Unix timestamp
- endTime (Number) - Unix timestamp
- duration (Number) - minutes
- createdAt (Number) - timestamp
- updatedAt (Number) - timestamp
```

---

## 🔌 Lambda API Endpoints

### Authentication
```
POST /auth/register
  Body: { username, password }
  Response: { userId, token }

POST /auth/login
  Body: { username, password }
  Response: { userId, token }
```

### Tasks Management
```
GET /tasks
  Headers: { Authorization: Bearer <token> }
  Response: [{ id, taskName, sessionType, startTime, endTime, duration }]

POST /tasks
  Body: { taskName, sessionType, startTime, endTime, duration }
  Response: { taskId, createdAt }

PUT /tasks/{taskId}
  Body: { taskName, sessionType, endTime, duration }
  Response: { updated task object }

DELETE /tasks/{taskId}
  Response: { success: true }

GET /tasks/date-range
  Query: { startDate, endDate }
  Response: [{ date, tasks: [...], totalTime }]
```

### Settings Management
```
GET /settings
  Headers: { Authorization: Bearer <token> }
  Response: { workTime, breakTime, longBreakTime }

PUT /settings
  Body: { workTime, breakTime, longBreakTime }
  Response: { updated settings }
```

### Data Management
```
POST /data/export
  Headers: { Authorization: Bearer <token> }
  Response: { JSON export of all tasks and settings }

DELETE /data/clear
  Headers: { Authorization: Bearer <token> }
  Response: { success: true, message: "All data cleared" }
```

---

## 🔄 Frontend Changes Required

### Minimal Changes to React App

1. **Update api.js**
   - Uncomment existing backend API calls
   - Add JWT token management (localStorage for token)
   - Add login/register screens

2. **Add Authentication Context**
   - Manage user state
   - Handle login/logout
   - Token refresh logic

3. **Add Login Component**
   - Username/password form
   - Registration option
   - Error handling

4. **Update App.js**
   - Remove browser session storage fallback (or keep as backup)
   - Call Lambda APIs instead
   - Add loading states

### Backward Compatibility
- Keep existing browser storage code
- Use Lambda API if available, fallback to session storage
- Seamless migration for existing users

---

## 🚀 Implementation Phases

### Phase 1: Core Backend Setup (Week 1-2)
- [ ] Set up AWS Lambda environment
- [ ] Create DynamoDB tables
- [ ] Implement JWT authentication
- [ ] Build basic CRUD operations

### Phase 2: API Development (Week 2-3)
- [ ] Implement all Lambda functions
- [ ] Set up API Gateway
- [ ] Add error handling and validation
- [ ] Basic logging and monitoring

### Phase 3: Frontend Integration (Week 3-4)
- [ ] Update React frontend
- [ ] Add login/register UI
- [ ] Connect to Lambda APIs
- [ ] Test end-to-end

### Phase 4: Testing & Deployment (Week 4-5)
- [ ] Unit tests for Lambda
- [ ] Integration tests
- [ ] Performance testing
- [ ] Deploy to AWS
- [ ] Monitor costs

---

## 💰 Cost Breakdown (Monthly in ₹)

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | 2 users, ~1000 requests/month | ₹0 (free tier) |
| **API Gateway** | ~1000 requests/month | ₹10-20 |
| **DynamoDB** | Pay-per-request, 2 users | ₹50-150 |
| **Data Transfer** | Minimal | ₹10-50 |
| **CloudWatch Logs** | First 5GB free | ₹0 |
| **Total** | | **₹100-250/month** |

**Well within the ₹500 budget** ✅

---

## 🔒 Security Considerations

1. **Password Hashing**: Use bcrypt (minimum 10 rounds)
2. **JWT Secret**: Strong random key (32+ characters)
3. **HTTPS**: API Gateway enforces HTTPS by default
4. **Input Validation**: Validate all inputs in Lambda
5. **CORS**: Configure properly for frontend origin
6. **Rate Limiting**: Implement to prevent abuse
7. **Token Storage**: Store in httpOnly cookies (if possible) or secure storage

---

## 🧪 Testing Strategy

### Unit Tests
- JWT token creation/validation
- Password hashing/verification
- Data validation functions
- DynamoDB queries

### Integration Tests
- Full API flows (register → login → create task → retrieve)
- Error scenarios
- Permission checks

### Load Testing
- Test with concurrent requests
- Monitor Lambda duration
- Monitor DynamoDB capacity

---

## 📚 Learning Resources

### JWT Implementation
- [jwt.io](https://jwt.io) - JWT introduction
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - Node.js JWT library

### AWS Lambda
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [Lambda with DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Lambda.html)

### DynamoDB
- [DynamoDB Design Patterns](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

## 📝 Notes

- This is a learning project, so prioritize understanding over optimization
- Start simple, add features incrementally
- Document as you build
- Keep backend and frontend loosely coupled
- Plan for future features (sharing tasks, analytics, etc.)

---

## ✅ Checklist Before Starting

- [ ] AWS account set up
- [ ] AWS CLI installed and configured
- [ ] Node.js installed locally
- [ ] Understanding of JWT basics
- [ ] Understanding of DynamoDB basics
- [ ] Backup of current frontend code

---

## Questions to Answer Before Implementation

1. Should users be able to change their password?
2. How long should JWT tokens be valid? (7 days, 30 days?)
3. Should deleted tasks be archived or permanently removed?
4. Multi-device sync needed?
5. Should there be user-to-user sharing of tasks?

---

**Last Updated**: January 17, 2026  
**Status**: Planned, Ready for Implementation
