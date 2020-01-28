FROM node:10.15.2
# create app directory
WORKDIR /src/download_app/data_producer
# install node modules
COPY package*.json ./

RUN npm install --silent
COPY . .

EXPOSE 8001

CMD ["npm", "start"]