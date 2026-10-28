FROM node:24-alpine

ENV PORT=8080

# Set working directory
WORKDIR /home/govsearch

# Update package lists and pull the latest secure ca-certificates
RUN apk update && apk add --no-cache ca-certificates

COPY package*.json ./
COPY dist ./dist
COPY public ./public

RUN npm ci --omit=dev

CMD ["npm", "start"]
