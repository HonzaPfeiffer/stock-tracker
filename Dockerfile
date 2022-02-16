FROM node
WORKDIR /app
COPY package.json .
RUN npm install --force
# ENV PATH ./node_modules/.bin:$PATH
COPY . .
EXPOSE 3000

# start app
CMD ["npm", "start"]