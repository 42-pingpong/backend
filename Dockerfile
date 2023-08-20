FROM node:18-alpine

RUN apk add --no-cache dumb-init tzdata && \
	cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

COPY apps/restapis/start.sh /tmp/start.sh

RUN chmod +x /tmp/start.sh

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["/bin/ash", "/tmp/start.sh"]
EXPOSE ${NEST_PORT} 
