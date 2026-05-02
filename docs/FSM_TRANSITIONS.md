# Finite State Machine (FSM) Transitions

## State Diagram
```
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             ▼
  ┌─────┐ CHECK_STATUS ┌──────────────┐ SUBMIT_FORM ┌──────────┐ VIOLATION_DETECTED
  │START│─────────────▶│NOT_REGISTERED│────────────▶│REGISTERED│─────────────▶ DISQUALIFIED
  └─────┘              └──────────────┘             └──────────┘                 ▲
                                                          │                      │
                                                          ▼ APPROVE_REGISTRATION │
                                                    ┌──────────┐                 │
                                                    │ VERIFIED │─────────────────┘
                                                    └──────────┘                 │
                                                          │                      │
                                                          ▼ FIND_POLLING_STATION │
                                                    ┌──────────┐                 │
                                                    │  READY   │─────────────────┘
                                                    └──────────┘                 │
                                                          │                      │
                                                          ▼ CAST_VOTE            │
                                                    ┌──────────┐                 │
                                                    │  VOTED   │                 │
                                                    └──────────┘                 │
                                                                                 │
                                                                                 ┘
```

## State Descriptions

| State | Description | Progress |
|-------|-------------|----------|
| START | Initial entry state. | 0% |
| NOT_REGISTERED | User is not yet registered to vote. | 10% |
| REGISTERED | Registration form submitted, pending approval. | 40% |
| VERIFIED | Identity and registration approved. | 70% |
| READY | Polling station found, ready to cast vote. | 90% |
| VOTED | Voting process completed. | 100% |
| DISQUALIFIED | Voter flagged for violation. | 0% |

## Transition Rules

| From | Event | To | Side Effects |
|------|-------|-----|--------------|
| START | CHECK_STATUS | NOT_REGISTERED | Initializes profile |
| NOT_REGISTERED | SUBMIT_FORM | REGISTERED | Validates form data |
| REGISTERED | APPROVE_REGISTRATION | VERIFIED | Triggers notification |
| VERIFIED | FIND_POLLING_STATION | READY | Calculates risk scores |
| READY | CAST_VOTE | VOTED | Finalizes record |
| * | VIOLATION_DETECTED | DISQUALIFIED | Blocks all further actions |

## Rollback Support
The StateMachine implementation supports a `rollback()` method that reverts the voter to their previous state in history, ensuring data integrity during process interruptions.
