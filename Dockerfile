FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package.json
RUN npm i
COPY . .

FROM base as dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base as prod
ENV NODE_ENV=production
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
