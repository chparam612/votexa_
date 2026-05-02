# Votexa API Endpoints

## Authentication
All endpoints require Firebase ID token in Authorization header:
```
Authorization: Bearer {idToken}
```

## Endpoints

### GET /api/health
Public endpoint to check system status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /api/actions/transition
Handle voter state transition events.

**Request Body:**
```json
{
  "event": "VERIFY_IDENTITY",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "from": "REGISTERED",
    "to": "VERIFIED",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

**Events:** CHECK_STATUS, SUBMIT_FORM, APPROVE_REGISTRATION, VERIFY_IDENTITY, FIND_POLLING_STATION, CAST_VOTE, VIOLATION_DETECTED

### GET /api/actions/status
Get current voter state and progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "state": "VERIFIED",
    "progress": 70,
    "meta": {
      "label": "Verified",
      "icon": "shield-checkmark",
      "color": "#6366F1"
    }
  }
}
```

### GET /api/dashboard
Get aggregated data for the voter dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "fsmState": "VERIFIED",
    "riskScore": 25,
    "actions": [...],
    "pollingStations": [...]
  }
}
```

### GET /api/polling-stations
Find nearby polling stations.

**Query Parameters:**
- `lat`: Latitude (-90 to 90, required)
- `lng`: Longitude (-180 to 180, required)
- `radius`: Search radius in meters (default 5000)

### POST /api/notifications/register-token
Register device for push notifications.

**Request Body:**
```json
{
  "token": "expo-push-token"
}
```
