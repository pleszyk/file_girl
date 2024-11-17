// import { BiSolidFileArchive } from "react-icons/bi"
// import { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import Loader from './Loader';
// import { Link, useNavigate } from 'react-router-dom';
// import { setCredentials } from '../slices/authSlice';
// import { useSelector, useDispatch } from 'react-redux';
// import { useUpdateUserMutation } from '../slices/usersApiSlice';

// function UpdateUser() {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { userInfo } = useSelector((state) => state.auth);

//   const [updateUser, { isLoading }] = useUpdateUserMutation();

//   useEffect(() => {
//     setName(userInfo.name);
//     setEmail(userInfo.email);
//   }, [userInfo.setName, userInfo.setEmail]);

//   const backHandler = () => {
//     navigate('/securePage');
//   };

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     if (password !== confirmPassword) {
//       toast('Passwords do not match!');
//     } else {
//       try {
//         const res = await updateUser({
//           _id: userInfo._id,
//           name,
//           email,
//           password,
//         }).unwrap();
//         dispatch(setCredentials({ ...res }));
//         toast('Profile Updated!');
//       } catch (err) {
//         toast(err?.data?.message || err.error);
//       }
//     }
//   };

//   return (
//     <>
//       <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
//         <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
//           <BiSolidFileArchive className='mx-auto h-16 w-auto'/>
//           <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
//             Update Profile
//           </h2>
//         </div>

//         <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
//           <form className='space-y-6' onSubmit={submitHandler}>
//             <div>
//               <label
//                 htmlFor='username'
//                 className='block text-sm font-medium leading-6 text-gray-900'
//               >
//                 Name
//               </label>
//               <div className='mt-2'>
//                 <input
//                   id='name'
//                   name='name'
//                   type='text'
//                   placeholder='Enter Name'
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   autoComplete='name'
//                   required
//                   className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
//                 />
//               </div>
//             </div>
//             <div>
//               <label
//                 htmlFor='email'
//                 className='block text-sm font-medium leading-6 text-gray-900'
//               >
//                 Email
//               </label>
//               <div className='mt-2'>
//                 <input
//                   id='email'
//                   name='email'
//                   type='email'
//                   placeholder='Enter Email'
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   autoComplete='email'
//                   required
//                   className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
//                 />
//               </div>
//             </div>

//             <div>
//               <div className='flex items-center justify-between'>
//                 <label
//                   htmlFor='password'
//                   className='block text-sm font-medium leading-6 text-gray-900'
//                 >
//                   Password
//                 </label>
//               </div>
//               <div className='mt-2'>
//                 <input
//                   id='password'
//                   name='password'
//                   type='password'
//                   placeholder='Enter password'
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete='current-password'
//                   required
//                   className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
//                 />
//               </div>
//             </div>

//             <div>
//               <div className='flex items-center justify-between'>
//                 <label
//                   htmlFor='password'
//                   className='block text-sm font-medium leading-6 text-gray-900'
//                 >
//                   Confirm Password
//                 </label>
//               </div>
//               <div className='mt-2'>
//                 <input
//                   id='confirmPassword'
//                   name='password'
//                   type='password'
//                   placeholder='Confirm password'
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   autoComplete='current-password'
//                   required
//                   className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
//                 />
//               </div>
//             </div>

//             <div>
//               <button
//                 type='submit'
//                 className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
//               >
//                 Update
//               </button>
//             </div>
//           </form>
//           <div className='pt-6'>
//             <button
//               onClick={backHandler}
//               type='submit'
//               className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
//             >
//               Back
//             </button>
//           </div>
//         </div>
//       </div>
//       {isLoading && <Loader />}
//     </>
//   );
// }
// export default UpdateUser;
