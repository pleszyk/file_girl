import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Loader from "../util/Loader";
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentToken, selectCurrentUser } from "../slices/authSlice"
import logo from '../assets/logo.png'
import Nav from './Nav';

function Register() {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch()

  const [register, { isLoading }] = useRegisterMutation()

  // const token = useSelector(selectCurrentToken)

  // useEffect(() => {
  //   if(token){
  //     navigate('/securePage')
  //   }
  // }, [navigate, token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (pwd !== confirmPwd) {
      toast('Passwords do not match!');
    } else {
      try {
        const userData = await register({ user, pwd }).unwrap()
        // dispatch(setCredentials({...userData}))
        toast('Registered! Please sign in')
        setUser('')
        setPwd('')
        navigate('/login')
      } catch (err) {
        if (!err?.response) {
          toast('No Server Response');
      } else if (err.response?.status === 409) {
          toast('Username Taken');
      } else {
          toast('Registration Failed')
      }
      }
    }
  };

  return (
    <>
      <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-2 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <img src={logo} className="mx-auto my-6 w-52"/>
          <h2 className='text-center text-2xl font-bold leading-9 tracking-tight text-gray-100'>
            Create an account
          </h2>
        </div>

        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className='space-y-6' onSubmit={submitHandler}>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium leading-6 text-gray-100'
              >
                Username
              </label>
              <div className='mt-2'>
                <input
                  id='username'
                  name='username'
                  type='text'
                  placeholder='Enter username'
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  autoComplete='name'
                  required
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>
            <div>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium leading-6 text-gray-100'
                >
                  Password
                </label>
              </div>
              <div className='mt-2'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='Enter password'
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoComplete='current-password'
                  required
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium leading-6 text-gray-100'
                >
                  Confirm Password
                </label>
              </div>
              <div className='mt-2'>
                <input
                  id='confirmPassword'
                  name='password'
                  type='password'
                  placeholder='Confirm password'
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  autoComplete='current-password'
                  required
                  className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                className='flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
              >
                Register
              </button>
            </div>
          </form>

          <div className='mt-10 text-center text-sm text-gray-400'>
            Already a member?{' '}
            <Link to={'/login'}>
              <div className='font-semibold leading-6 text-orange-600 hover:text-orange-700'>
                Login
              </div>
            </Link>
          </div>
        </div>
      </div>
      {isLoading && <Loader/>}
    </>
  );
}
export default Register;
