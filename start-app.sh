echo STARTING

npm install -f
cd server && npm install -f && npx prisma generate && cd ..
cd client && npm install -f 
cd ..
npm run start:app