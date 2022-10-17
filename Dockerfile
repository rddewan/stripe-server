FROM node:10
WORKDIR /usr/src/app

# install packages
COPY package*.json ./
RUN npm install

ENV NODE_ENV=production

# copy file over
COPY . .

# Build 
RUN npm run build 

# Serve
CMD ["npm", "start"]


