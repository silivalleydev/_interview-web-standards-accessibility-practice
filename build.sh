export $(cat .env | xargs)

docker build -t $DOCKER_IMAGE_DEV_NAME -f DEV_Dockerfile .