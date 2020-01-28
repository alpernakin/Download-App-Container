FROM node:10.15.2
# create app directory
WORKDIR /src/download_app/backend
# install node modules
COPY package*.json ./

RUN npm install --silent
COPY . .

EXPOSE 7779

CMD ["npm", "start"]