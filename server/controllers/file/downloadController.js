const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Session } = require("./util/s3Session");

const download = async (req, res) => {
  const user = req.query.username;
  const file = req.query.file;
  const s3Client = await s3Session(user);
  const objKey = `${user}/${file}`;

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: objKey,
  };

  try {
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 10 });

    res.status(200).json({ signedUrl: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err}` });
  }
};

module.exports = { download };
