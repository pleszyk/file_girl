<div align="center">
  <h1>fileGirl</h1>
</div>

<div align="center">
  <img src="./client/public/favicon.ico" alt="Description of image" width="64" height="64" />
</div>

![design](design.png)

Brief overview
--------------

Front end
--------

Home.jsx
--------
Here is the homepage
transitions through slogans
maps through cards describing the service

Register.jsx
------------
Here the user registers for an account
username / password stored in state
uses redux api slices to make calls to backend
usersApiSlice.js
Post request to /register including username/password

Backend
-------

registerController.js
-----------
checks if username already exists in db
hashes password
saves user in db with username & hashed password
sends success response,
frontend sends user to login page

Login.jsx
---------
username/password sent to /auth


authController.js
---------
finds user in db
compares password to hashed password from db
signs jsonwebtoken accessToken & refreshToken
sends refreshtoken as cookie
sends reponse accessToken

AuthSlice.js
--------
accessToken stored in global state with redux


When accessToken Expires or is not present
and trying to access protected endpoint

apiSlice.js
redux baseQuery with baseQueryWithReauth
if error code 403 or 401 resets credentials with /refresh

refreshTokenController.js
--------------------
gets cookie from request
evalutes jwt to ensure refresh token is valid
signs new accessToken & refreshtoken
sends back to frontend



UPLOAD
------

Upload.jsx
----------
user selects a file to upload
if choose encrypt option it runs encryption
function on file before uploading

checks file size, if > 64mb
requests multiple signed urls from Aws
slices file up into chunks
matches parts to urls
uploads parts concurrently
completes upload with /complete endpoint

Backend
-------

UploadController.js

requests session token with access to users directory 'bucket/user/'
Gets s3 session with temporary credentials from sts

checks storage cap limit
checks if file already exists

gets single or multiple signedurls from Aws depending
saves file metadata to database

returns url in response
