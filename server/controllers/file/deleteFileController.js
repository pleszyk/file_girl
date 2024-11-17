const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const File = require("../../model/File");
const User = require("../../model/User");
const { s3Session } = require("./util/s3Session");

const deleteFile = async (req, res) => {
  try {
    const file = req.query.file;
    const user = req.query.username;
    const s3Client = await s3Session(user);
    //DB
    const foundUser = await User.findOne({ username: user }).exec();

    // console.log(result.acknowledged === true)

    //S3
    const objKey = `${foundUser.username}/${file}`;

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: objKey,
    };

    const awsDel = await s3Client.send(new DeleteObjectCommand(params));
    if (awsDel.$metadata.httpStatusCode !== 204) {
      throw new Error("File deletion from AWS S3 failed");
    }

    const result = await File.deleteOne({ filename: file });
    if (!result.acknowledged) {
      throw new Error("File deletion failed in the database");
    }

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err}` });
  }
};

module.exports = { deleteFile };
