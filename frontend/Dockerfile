FROM node:10.15.2
# create app directory
WORKDIR /src/download_app/frontend
# install node modules
COPY package*.json ./

RUN npm install --silent
# for angular commands
RUN npm install -g @angular/cli  --silent

COPY . .

# serve it
CMD ["ng", "serve", "--host", "0.0.0.0"]