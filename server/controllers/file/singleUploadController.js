const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const File = require("../../model/File");
const User = require("../../model/User");
const { s3Session } = require("./util/s3Session");
const { storageCap } = require("./util/storageCap")

const upload = async (req, res) => {
  const fileName = req.query.fileName;
  const user = req.query.username;
  const size = +req.query.size;
  const encrypted = req.query.encrypted;
  const salt = req.query.salt;
  const iv = req.query.iv;
  const s3Client = await s3Session(user);

  try {
    const foundUser = await User.findOne({ username: user }).exec();
    const foundFile = await File.findOne({ filename: fileName });

    //file exists
    if (foundFile) {
      res.json({ message: "file already exists" });
      return;
    }

    // Check the storage cap
    const storageExceeded = await storageCap(user, size);

    if (storageExceeded) {
      res.json({
        message: "Storage capacity exceeded. Cannot upload the file.",
      });
      return;
    }

    //S3
    const objKey = `${user}/${fileName}`;
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: objKey,
      ContentType: "application/octet-stream",
    };

    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    //DB
    if (encrypted) {
      const file = new File({
        filename: fileName,
        size: size,
        owner: foundUser._id,
        encrypted: encrypted,
        salt: salt,
        iv: iv,
      });
      file.save();
    } else {
      const file = new File({
        filename: fileName,
        size: size,
        owner: foundUser._id,
        encrypted: encrypted,
      });
      file.save();
    }

    res.status(200).json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err}` });
  }
};

module.exports = { upload };
