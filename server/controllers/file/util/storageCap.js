const User = require("../../../model/User");
const File = require("../../../model/File");

const storageCap = async (user, size) => {
    // Retrieve the user's total storage used
    const foundUser = await User.findOne({ username: user }).exec();
    const fileList = await File.find({ owner: foundUser._id });
  
    let totalSize = 0;
  
    // Iterate through fileList and calculate the total size
    fileList.forEach((file) => {
      totalSize += file.size;
    });
  
    // Define a maximum storage cap
    const maxStorageCap = 300 * 1024 * 1024;
  
    // Check if the total size plus the new file size exceeds the storage cap
    return totalSize + size > maxStorageCap;
  };

module.exports = { storageCap };