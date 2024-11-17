const { S3Client } = require("@aws-sdk/client-s3");
const { sessionToken } = require("./sessionToken");

const s3Session = async (user) => {
  const session = await sessionToken(user);

  const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REG,
    // useAccelerateEndpoint: true,
    credentials: {
      accessKeyId: session.AccessKeyId,
      secretAccessKey: session.SecretAccessKey,
      sessionToken: session.SessionToken,
    },
  });
  return s3Client;
};

module.exports = { s3Session };