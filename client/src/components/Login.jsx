import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-hot-toast';
import Loader from '../util/Loader';
import logo from '../assets/logo.png'
import { selectCurrentToken, selectCurrentUser } from '../slices/authSlice';
import Nav from './Nav';

function Login() {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();


  //!!! has loading built in
  const [login, { isLoading }] = useLoginMutation();

  // const token = useSelector(selectCurrentToken)

  // useEffect(() => {
  //   if(token){
  //     navigate('/securePage')
  //   }
  // }, [navigate, token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const userData = await login({ user, pwd }).unwrap();
      dispatch(setCredentials({ ...userData, user }));
      toast('Signed In!');
      setUser('');
      setPwd('');
      navigate('/library');
    } catch (err) {
      if (!err?.originalStatus) {
        toast('No Server Response');
    } else if (err.originalStatus === 400) {
        toast('Missing Username or Password');
        //throws user out
    } else if (err.originalStatus === 401) {
        toast('Incorrect Password');
    } else {
        toast('Sign in Failed');
    }
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-2 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img src={logo} className="mx-auto my-6 w-52"/>
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-100">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={submitHandler}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-100"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  autoComplete="name"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-100"
                >
                  Password
                </label>
                {/* <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div> */}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-10 text-center text-sm text-gray-400">
            Not a member?{' '}
            <Link to={'/register'}>
              <div className="font-semibold leading-6 text-orange-600 hover:text-orange-700">
                Register
              </div>
            </Link>
          </div>
        </div>
      </div>
      {isLoading && <Loader />}
    </>
  );
}
export default Login;