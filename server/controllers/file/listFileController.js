const File = require("../../model/File");
const User = require("../../model/User");

const listFiles = async (req, res) => {
    const user = req.query.username;
  
    try {
      const foundUser = await User.findOne({ username: user }).exec();
      const fileList = await File.find({ owner: foundUser._id });
      let totalSize = 0;
  
      // Iterate through fileList and calculate the total size
      fileList.forEach((file) => {
        totalSize += file.size;
      });
  
      res.status(200).json({ fileList, totalSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: `Server error: ${err}` });
    }
  };

module.exports = { listFiles }