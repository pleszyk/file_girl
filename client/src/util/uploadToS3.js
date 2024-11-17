// import axios from 'axios';

// // Function to upload a file to S3 using a signed URL
// export async function uploadToS3(signedUrl, file) {
//   try {
//     const response = await axios.put(signedUrl, file, {
//       headers: {
//         'Content-Type': 'application/octet-stream', // or any other relevant MIME type
//       },
//     });
//     return response.data; // You can return the response if needed
//   } catch (error) {
//     throw error; // Handle errors as needed
//   }
// }

import axios from "axios";

// Function to upload a file to S3 using a signed URL with progress tracking
export async function uploadToS3WithProgress(url, file, onProgress) {
  try {
    const response = await axios.put(url, file, {
      headers: {
        "Content-Type": "application/octet-stream", // or any other relevant MIME type
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && typeof onProgress === "function") {
          onProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        }
      },
    });
    
    return response; // You can return the response if needed
  } catch (error) {
    throw error; // Handle errors as needed
  }
}
