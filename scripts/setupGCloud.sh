#!/bin/bash
set -e

PROJECT_ID="votexa-ac15c"
REGION="asia-south1"

echo "Setting project..."
gcloud config set project $PROJECT_ID

echo "Enabling APIs..."
gcloud services enable \
  secretmanager.googleapis.com \
  redis.googleapis.com \
  compute.googleapis.com \
  cloudtasks.googleapis.com \
  pubsub.googleapis.com \
  bigquery.googleapis.com \
  aiplatform.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  firestore.googleapis.com \
  distance-matrix-backend.googleapis.com

echo "Creating Memorystore (Redis)..."
gcloud redis instances create votexa-cache --size=1 --region=$REGION --redis-version=redis_6_x

echo "Creating Pub/Sub topics..."
gcloud pubsub topics create votexa-fsm-transitions
gcloud pubsub topics create votexa-risk-alerts
gcloud pubsub topics create votexa-notifications

echo "Creating Cloud Tasks queue..."
gcloud tasks queues create votexa-notifications --location=$REGION

echo "Creating BigQuery dataset..."
bq --location=$REGION mk -d \
    --description "Votexa Analytics Dataset" \
    votexa_analytics || true

bq mk -t --schema event_type:STRING,user_id:STRING,properties:STRING,timestamp:TIMESTAMP,district:STRING,state:STRING \
    votexa_analytics.events || true

echo "Deploying to Cloud Run..."
gcloud run deploy votexa-backend \
  --source apps/backend \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID

echo "Setup complete!"
