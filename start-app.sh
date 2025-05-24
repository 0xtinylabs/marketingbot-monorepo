echo STARTING

npm install -f
cd server && npm install -f && npx prisma generate && cd ..
cd app && npm install -f && cd ..
migration=$(openssl rand -hex 16)
echo "${migration}"
cd client && yes | npx prisma migrate dev --name ${migration} && npm install -f 
cd ..
npm run start:app