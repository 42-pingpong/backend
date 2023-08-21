FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init tzdata && \
	cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

COPY start.sh /tmp/start.sh
RUN chmod +x /tmp/start.sh

COPY package.json .

RUN npm install

COPY apps/restapis/.env.dev ./env

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["/bin/ash", "/tmp/start.sh"]
EXPOSE ${NEST_PORT}