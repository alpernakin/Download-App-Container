FROM node:10.15.2
# create app directory
WORKDIR /src/download_app/frontend
# install node modules
COPY package*.json ./

RUN npm install --silent
COPY . .

EXPOSE 4200

CMD ["npm", "start"]