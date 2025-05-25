echo STARTING

npm install -f
migration=$(openssl rand -hex 16)
echo "${migration}"
# cd server && npm install -f &&  yes | npx prisma migrate dev --name ${migration} && npx prisma generate && cd ..
cd app && npm install -f && cd ..
cd client  && npm install -f 
cd ..
npm run start:app