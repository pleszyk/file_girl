import { useState } from "react";
import Loader from "../util/Loader";
import toast from "react-hot-toast";
import {
  useGetMultiURLMutation,
  useGetSignedURLMutation,
  usePostCompleteMutation,
} from "../slices/fileApiSlice";
import { selectCurrentUser } from "../slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
// import { uploadToS3 } from '../util/uploadToS3';
import { uploadToS3WithProgress } from "../util/uploadToS3";
import { AiOutlineCloudUpload, AiFillFolderOpen } from "react-icons/ai";
import FileList from "./FileList";
import { setLoading } from "../slices/fileSlice";
import { Encrypt } from "../util/encrypt";

function Upload() {
  const [progress, setProgress] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);

  const Loading = useSelector((state) => state.file.Loading);

  const [getSignedURL] = useGetSignedURLMutation();
  const [getMultiSignedURL] = useGetMultiURLMutation();
  const [postComplete] = usePostCompleteMutation();

  const progressCallback = (percentCompleted) => {
    setProgress(percentCompleted);
  };

  const handleUploadFolder = async (event) => {
    const files = event.target.files; // Get an array of selected files

    //make it work in parrallel?, removing await works but progress is messed up
    //have popup for folder name?
    //if not all files uploaded normally
    //add /foldername/ to filename?
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await handleUpload({ target: { files: [file] } });
    }
  };

  const handleUpload = async (event) => {
    let file = event.target.files[0];
    file.encrypted = false;

    if (isChecked) {
      if (passphrase !== "") {
        let encrypted = await Encrypt(file, passphrase);
        file = encrypted.blob;
        setPassphrase("");
        setIsChecked(false);

        //convert iv/salt to base64
        file.iv = btoa(String.fromCharCode.apply(null, file.iv));
        file.salt = btoa(String.fromCharCode.apply(null, file.salt));
      } else {
        toast("Passphrase required for encryption");
        return;
      }
    }

    //////////////////////
    //Multi part upload///
    //////////////////////
    //100MB
    if (file.size >= 64 * 1024 * 1024) {
      try {
        dispatch(setLoading(true));

        const res = await getMultiSignedURL({
          username: user,
          fileName: file.name,
          size: file.size,
        });

        //file exists
        if (res.data.message) {
          toast(res.data.message);
          event.target.value = "";
          dispatch(setLoading(false));
          return;
        }

        const { parts, uploadId } = res.data;

        const totalSize = file.size;
        const chunkSize = 64 * 1024 * 1024; // 64MB
        const totalChunks = Math.ceil(totalSize / chunkSize);

        //Multi-part progress
        const chunkProgress = new Array(totalChunks).fill(0);

        const multiProgressCallback = (percentCompleted, chunkNumber) => {
          chunkProgress[chunkNumber] = percentCompleted;
          // Calculate the overall progress based on the average of chunk progress
          const overallProgress =
            chunkProgress.reduce((total, progress) => total + progress, 0) /
            totalChunks;
          setProgress(overallProgress);
        };

        // Function to upload a single chunk and return a Promise
        const uploadPromises = [];
        const uploadChunk = async (chunkNumber) => {
          const start = chunkNumber * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);

          let url = parts[chunkNumber].partPresignedUrl;
          let ind = parts[chunkNumber].index;
          console.log(ind, url, chunk);

          let retryCount = 0;

          while (retryCount < 3) {
            try {
              const response = await uploadToS3WithProgress(
                url,
                chunk,
                (percentCompleted) => {
                  multiProgressCallback(percentCompleted, chunkNumber);
                }
              );
              const eTag = response.headers["etag"].replace(/"/g, "");

              return { PartNumber: chunkNumber + 1, ETag: eTag };
            } catch (error) {
              // Handle upload error for this chunk
              console.error(
                `Error uploading chunk ${chunkNumber + 1} (attempt ${
                  retryCount + 1
                }): ${error.message}`
              );
              retryCount++;
            }
          }

          // If all retry attempts fail, return null or handle the error as needed
          console.error(
            `Failed to upload chunk ${chunkNumber} after 3 attempts`
          );
          return null;
        };

        // Create an array of Promises for parallel uploading
        for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
          uploadPromises.push(uploadChunk(chunkNumber));
        }

        // Use Promise.all to upload chunks in parallel
        const completedParts = await Promise.all(uploadPromises);
        // Check if all parts were successfully uploaded
        const allPartsUploaded = completedParts.every((part) => part !== null);

        console.log(completedParts);

        if (allPartsUploaded) {
          const res2 = await postComplete({
            username: user,
            fileName: file.name,
            uploadId: uploadId,
            completedParts: JSON.stringify(completedParts),
            size: file.size,
            encrypted: file.encrypted,
            salt: file.salt,
            iv: file.iv,
          });
          toast(res2.data.message);
          setProgress(0);
          event.target.value = "";
          dispatch(setLoading(false));
          // setPassphrase("");
          // setIsChecked(false);
        }
      } catch (error) {
        toast(error);
        console.log(error);
      }
    } else {
      //////////////////////
      //Single part upload//
      //////////////////////
      try {
        dispatch(setLoading(true));
        const res = await getSignedURL({
          username: user,
          fileName: file.name,
          size: file.size,
          encrypted: file.encrypted,
          salt: file.salt,
          iv: file.iv,
        });
        //file exists
        if (res.data.message) {
          toast(res.data.message);
          event.target.value = "";
          dispatch(setLoading(false));
          return;
        }
        const url = res.data;
        // setSignedUrl(signedUrl);
        //upload to s3
        // await uploadToS3(url, file);
        console.log(url);

        await uploadToS3WithProgress(url, file, progressCallback);

        toast("File uploaded successfully");
        setProgress(0);
        event.target.value = "";
        dispatch(setLoading(false));
        setPassphrase("");
        setIsChecked(false);
        // setFile(null);
        // setSignedUrl(null)
      } catch (error) {
        toast(error);
        console.log(error);
      }
    }
  };
  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="text-lg pt-5 p-4 text-gray-100 flex items-center">
        <div className="flex-1">Welcome {user}</div>
      </div>
      <div className="flex flex-row items-center justify-center w-full p-4">
        {progress !== 0 && (
          <div className="fixed top-0 left-0 w-full h-0.5">
            <div
              className="h-full bg-orange-700"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-1/6 border-2 border-gray-700 rounded-lg cursor-pointer hover:bg-orange-800 bg-orange-700"
        >
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            <AiOutlineCloudUpload className="text-3xl text-[#202935]" />
          </div>
          <input
            onChange={handleUpload}
            id="dropzone-file"
            type="file"
            className="hidden"
          />
        </label>
        <label
          htmlFor="dropzone-folder"
          className="flex flex-col items-center justify-center ml-6 w-1/6 border-2 border-gray-700 rounded-lg cursor-pointer hover:bg-orange-800 bg-orange-700"
        >
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            <AiFillFolderOpen className="text-3xl text-[#202935]" />
          </div>
          <input
            directory=""
            webkitdirectory=""
            onChange={handleUploadFolder}
            id="dropzone-folder"
            type="file"
            className="hidden"
          />
        </label>
      </div>
      <div className="flex justify-center items-center">
        <input
          onChange={() => setIsChecked((prev) => !prev)}
          checked={isChecked}
          id="default-checkbox"
          type="checkbox"
          value=""
          className="w-4 h-4 focus:text-primary focus:ring-offset-0 focus:ring-0 rounded bg-gray-700 border-gray-600"
        />
        <label
          htmlFor="default-checkbox"
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Encrypt?
        </label>
      </div>
      {isChecked && (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-2 lg:px-8">
          <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-100"
                >
                  Encryption passphrase
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter phrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    autoComplete="name"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="m-4">
        <FileList />
      </div>

      <div className="text-center">
        {Loading && <Loader />}
        {progress !== 0 && (
          <div className="text-gray-200 pl-2">{Math.round(progress)}%</div>
        )}
      </div>
    </div>
  );
}

export default Upload;
