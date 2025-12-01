FROM node:18  # TODO check image

WORKDIR /pippins

COPY package.json package.json
COPY package-lock.json package-lock.json

COPY static/ static/
COPY index.html index.html
COPY src/ src/

RUN npm ci

EXPOSE 5173

CMD ["npm", "run", "dev"]
