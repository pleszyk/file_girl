import { useState, useEffect } from 'react'
import {
  useDeleteFileMutation,
  useDlSignedURLMutation,
  useGetFilesMutation,
} from '../slices/fileApiSlice'
import { selectCurrentUser } from '../slices/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { IoMdTrash } from 'react-icons/io'
import { FaCloudDownloadAlt } from 'react-icons/fa'
import { BsFileEarmarkLock2Fill } from 'react-icons/bs'
import { AiFillFolderOpen } from 'react-icons/ai'
// import Loader from '../util/Loader'
import { setLoading } from '../slices/fileSlice'
import { Decrypt } from '../util/encrypt'

function FileList() {
  const [files, setFiles] = useState(null)
  // const [signedUrl, setSignedUrl] = useState(null);
  const [popup, setPopup] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [cryptfile, setCryptfile] = useState(null)
  const [total, setTotal] = useState(0)
  const [percent, setPercent] = useState(0)

  //it doesnt work bc when i try to initally fetch data
  // it is null b4 the refresh, after it sends refreshtoken the user is Paul
  //
  const user = useSelector(selectCurrentUser)

  const Loading = useSelector((state) => state.file.Loading)
  // console.log(Loading)

  const dispatch = useDispatch()

  //try getting the loading state from these?
  //see register component
  const [getFiles] = useGetFilesMutation()
  const [deleteFile] = useDeleteFileMutation()
  const [downloadFile] = useDlSignedURLMutation()

  function convertBytes(bytes) {
    if (bytes < 1024) {
      return bytes.toFixed(2) + ' B'
    } else if (bytes < 1048576) {
      // 1024 KB
      return (bytes / 1024).toFixed(2) + ' KB'
    } else if (bytes < 1073741824) {
      // 1024 MB
      return (bytes / 1048576).toFixed(2) + ' MB'
    } else {
      // 1024 GB
      return (bytes / 1073741824).toFixed(2) + ' GB'
    }
  }

  //it need to try the request before it can send refresh token
  //hence the null value for user
  //could handle 500 error
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFiles({ username: user })
        setFiles(res.data.fileList)
        setTotal(convertBytes(+res.data.totalSize))
        setPercent(
          ((+res.data.totalSize / (300 * 1024 * 1024)) * 100).toFixed(
            2,
          ),
        )
      } catch (error) {
        console.error('Error fetching files:', error)
      }
    }
    if (!Loading) {
      fetchData()
    }
  }, [Loading, user])
  //user causes it to refresh twice when logging out because user changes to null

  const Click = async (file) => {
    dispatch(setLoading(true))
    const res = await deleteFile({ file: file.filename, username: user })
    if (res.error) {
      toast(res.error.data.message)
    } else {
      toast(res.data.message)
    }
    dispatch(setLoading(false))
  }

  const Submit = async (e) => {
    e.preventDefault()
    dispatch(setLoading(true))
    try {
      const res = await downloadFile({
        username: user,
        file: cryptfile.filename,
      })
      const { signedUrl } = res.data

      //DECRYPT
      const response = await fetch(signedUrl)
      if (!response.ok) {
        throw new Error(`Failed to download the file: ${response.status}`)
      }
      // Read the response as an ArrayBuffer
      const encryptedFile = await response.arrayBuffer()
      console.log(response)
      console.log(encryptedFile)

      //shorter
      const salt = new Uint8Array(
        atob(cryptfile.salt)
          .split('')
          .map((char) => char.charCodeAt(0)),
      )
      const iv = new Uint8Array(
        atob(cryptfile.iv)
          .split('')
          .map((char) => char.charCodeAt(0)),
      )

      const encryptedData = { encryptedFile, iv, salt }
      console.log(encryptedData)

      // Decrypt the encrypted data
      const decryptedData = await Decrypt(encryptedData, passphrase)
      console.log(decryptedData)

      // Create an object URL for the Blob
      const blobUrl = URL.createObjectURL(decryptedData)

      // Create a download link and set its properties
      const downloadLink = document.createElement('a')
      downloadLink.href = blobUrl
      downloadLink.download = cryptfile.filename // Specify the desired filename

      document.body.appendChild(downloadLink)

      // Trigger a click event on the download link
      downloadLink.click()

      // Remove the download link and revoke the Blob URL to free up resources
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(blobUrl)

      setPopup(false)
      setCryptfile(null)
      setPassphrase('')
      dispatch(setLoading(false))
    } catch (error) {
      toast('Decryption failed')
      console.log(error)
      setPassphrase('')
      dispatch(setLoading(false))
    }
  }

  //intercept the download if encrypted then decrypt
  const download = async (file) => {
    console.log(file)
    if (file.encrypted) {
      setPopup(true)
      setCryptfile(file)
      toast('Enter decryption passphrase')
      return
    }
    try {
      const res = await downloadFile({
        username: user,
        file: file.filename,
      })
      const { signedUrl } = res.data

      const downloadLink = document.createElement('a')
      downloadLink.href = signedUrl
      downloadLink.download = file.filename // Specify the desired filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      toast(error)
      console.log(error)
    }
  }


  return (
    <>
      <div className="border-solid text-gray-200 rounded w-full p-2 border-2 border-gray-700">

        <div className="text-center">Library <AiFillFolderOpen className="inline mb-0.5" /></div>
        <div className="h-[2px] w-1/4 mx-auto bg-orange-800 rounded-md"></div>
        {files && files.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 my-4">
            {files.slice().reverse().map((file) => (
              <div
                className="px-4 py-3 border-2 hover:border-orange-700 border-gray-700 rounded-lg shadow-md  flex flex-col gap-4"
                key={file._id}
              >
                <div className="flex items-center">
                  <div className="font-semibold w-full break-words text-lg">{file.filename}
                    {file.encrypted && (
                      <BsFileEarmarkLock2Fill className="text-lg inline text-gray-500 ml-2 mb-1" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between gap-2 mt-auto">
                  <button onClick={() => download(file)} className="">
                    <FaCloudDownloadAlt className="text-3xl hover:text-orange-600" />
                  </button>
                  <button onClick={() => Click(file)} className="">
                    <IoMdTrash className="text-3xl hover:text-orange-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>Empty Library</div>
        )}
        {/* <div className="text-orange-600">~~~~~~~~</div> */}
        {/* {percent > 0 && ( */}
        <div className="mt-2 pb-4">
          <div className="text-gray-200 text-xs">{total} / 300 MB</div>
          <div className="bg-gray-700 w-1/3 h-1 rounded-full">
            <div
              className="bg-orange-700 h-1 rounded-full"
              style={{ width: `${percent}%` }}
            ></div>
            <div className="text-gray-200 text-xs">{percent}% full</div>
          </div>
        </div>
        {/* )} */}
      </div>

      {popup && (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-2 lg:px-8">
          <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={Submit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-gray-100"
                >
                  Decryption passphrase
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
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="flex w-1/5 justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                >
                  Decrypt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default FileList
