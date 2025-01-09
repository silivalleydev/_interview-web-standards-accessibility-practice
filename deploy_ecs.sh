#!/bin/bash
export $(cat .env | xargs)



# aws ecs register-task-definition \
#   --region $AWS_REGION \
#   --family $TASK_DEFINITION_NAME \
#   --container-definitions "[{
#       \"name\":\"$CONTAINER_NAME\",
#       \"image\":\"$LATEST_IMAGE_URI\",
#       \"cpu\":256,
#       \"memory\":512
#     }]" \
#   --no-cli-pager
  

aws ecs update-service \
  --region $AWS_REGION \
  --cluster $ECS_CLUSTER_NAME \
  --service $ECS_SERVICE_NAME \
  --task-definition $TASK_DEFINITION_NAME \
  --no-cli-pager

