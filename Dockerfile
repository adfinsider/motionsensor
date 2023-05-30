FROM node:17-alpine as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm config set unsafe-perm true
# RUN npm install -g typescript
# RUN npm install -g ts-node
RUN npm install -g @vercel/ncc
USER node
COPY --chown=node:node . .
RUN npm install 
RUN mkdir nccdist
RUN ncc build index.js -o nccdist
 
 
#STAGE 2
FROM arm64v8/node:17.9.1-stretch-slim
WORKDIR /app
COPY --from=builder /home/node/app/nccdist/index.js .
RUN ls
EXPOSE 8000
CMD [ "node", "index.js" ]

