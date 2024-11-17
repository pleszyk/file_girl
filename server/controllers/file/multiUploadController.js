const {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const File = require("../../model/File");
const User = require("../../model/User");
const { s3Session } = require("./util/s3Session");
const { storageCap } = require("./util/storageCap")

/* 
███╗   ███╗██╗   ██╗██╗  ████████╗██╗    
████╗ ████║██║   ██║██║  ╚══██╔══╝██║    
██╔████╔██║██║   ██║██║     ██║   ██║    
██║╚██╔╝██║██║   ██║██║     ██║   ██║    
██║ ╚═╝ ██║╚██████╔╝███████╗██║   ██║    
╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝                                  
*/
const multi = async (req, res) => {
  const fileName = req.query.fileName;
  const user = req.query.username;
  const size = +req.query.size;
  const s3Client = await s3Session(user);

  const foundFile = await File.findOne({ filename: fileName });

  //file exists
  if (foundFile) {
    res.json({ message: "file already exists" });
    return;
  }

  // Check the storage cap
  const storageExceeded = await storageCap(user, size);

  if (storageExceeded) {
    res.json({ message: "Storage capacity exceeded. Cannot upload the file." });
    return;
  }

  //S3

  const objKey = `${user}/${fileName}`;

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: objKey,
    ContentType: "application/octet-stream",
  };

  const createMultipartUploadCommand = new CreateMultipartUploadCommand(params);
  const uploadIdResponse = await s3Client.send(createMultipartUploadCommand);
  const uploadId = uploadIdResponse.UploadId;

  const partSize = 64 * 1024 * 1024; // 64 MB part size
  const totalParts = Math.ceil(size / partSize);

  const multiParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: objKey,
    UploadId: uploadId,
  };

  // Function to get a presigned URL for a specific part number
  const getPresignedUrlForPart = async (partNumber) => {
    const command = new UploadPartCommand({
      ...multiParams,
      PartNumber: partNumber,
    });

    const partPresignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    return { index: partNumber - 1, partPresignedUrl };
    // Adjust the index to start from 0
  };

  // Create an array of promises for the getSignedUrl operations
  const urlPromises = [];

  for (let index = 1; index <= totalParts; index++) {
    urlPromises.push(getPresignedUrlForPart(index));
  }

  // Wait for all getSignedUrl promises to resolve concurrently
  Promise.all(urlPromises)
    .then((parts) => {
      // Sort the presignedUrls array by the original part number (index)
      parts.sort((a, b) => a.index - b.index);
      console.log(parts);
      res.status(200).json({ parts, uploadId });
    })
    .catch((error) => {
      console.error("Error generating presigned URLs:", error);
      res.status(500).json({ error: "Error generating presigned URLs" });
    });
};

/*
   ██████╗ ██████╗ ███╗   ███╗██████╗ ██╗     ███████╗████████╗███████╗
  ██╔════╝██╔═══██╗████╗ ████║██╔══██╗██║     ██╔════╝╚══██╔══╝██╔════╝
  ██║     ██║   ██║██╔████╔██║██████╔╝██║     █████╗     ██║   █████╗  
  ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║     ██╔══╝     ██║   ██╔══╝  
  ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ███████╗███████╗   ██║   ███████╗
   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝   ╚═╝   ╚══════╝                                                       
  */
const complete = async (req, res) => {
  const fileName = req.query.fileName;
  const user = req.query.username;
  const completedParts = req.query.completedParts;
  const uploadId = req.query.uploadId;
  const size = +req.query.size;
  const encrypted = req.query.encrypted;
  const salt = req.query.salt;
  const iv = req.query.iv;
  const s3Client = await s3Session(user);

  try {
    const objKey = `${user}/${fileName}`;
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: objKey,
      MultipartUpload: {
        Parts: JSON.parse(completedParts),
      },
      UploadId: uploadId,
    };

    // Send the CompleteMultipartUpload command
    const command = new CompleteMultipartUploadCommand(params);
    const s3Res = await s3Client.send(command);
    // if (s3Res.$metadata.httpStatusCode === 200) {
    //   throw new Error("s3 completion failed");
    // }
    //DB
    const foundUser = await User.findOne({ username: user }).exec();

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

    // Handle the result and return a success response
    res.status(200).json({ message: "Upload success" });
  } catch (error) {
    // Handle errors
    console.error("Error completing multipart upload:", error);
    res.status(500).json({ message: "Upload failed, try again" });
  }
};

module.exports = { multi, complete };
