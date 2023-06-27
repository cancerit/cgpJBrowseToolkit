FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
	nodejs \
	npm \
	libnss3-dev \
	libxss-dev \
	libasound-dev

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY js .   

CMD ["/bin/bash"]
