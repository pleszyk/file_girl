import React from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../slices/authSlice";
import { useLogoutMutation } from "../slices/usersApiSlice";

function Nav() {
  const user = useSelector(selectCurrentUser);

  const [logoutApiCall] = useLogoutMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async (e) => {
    e.preventDefault();
    try {
      //moved up to prevent refresh from user change in filelist
      navigate("/");
      await logoutApiCall().unwrap();
      dispatch(logout());
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <nav className="bg-[#19202a]">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-1 px-4">
        <Link to="/" className="flex items-center">
          <img src={logo} className="h-12" alt="Logo" />
          <span className="self-center text-2xl whitespace-nowrap italic text-gray-100 ">
            fileGirl
          </span>
        </Link>
        <div className="w-auto" id="navbar-solid-bg">
          <ul className="flex flex-row font-medium rounded-lg bg-gray-50 space-x-6 mt-0 border-0 bg-transparent dark:bg-gray-800 dark:bg-transparent dark:border-gray-700">
            {user ? (
              <>
                <Link
                  to="/library"
                  className="block py-2 text-orange-600 rounded bg-transparent p-0"
                  aria-current="page"
                >
                  {user}'s Library
                </Link>
                <li>
                  <button
                    onClick={logoutHandler}
                    className="block py-2 text-orange-600 rounded bg-transparent p-0"
                    aria-current="page"
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/register"
                    className="block py-2 text-orange-600 rounded bg-transparent p-0"
                    aria-current="page"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="block py-2 text-orange-600 rounded bg-transparent p-0"
                    aria-current="page"
                  >
                    Sign In
                  </Link>
                </li>
              </>
            )}
            {/* <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-orange-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                logout
              </a>
            </li> */}
            {/* <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Contact
              </a>
            </li> */}
          </ul>
        </div>
      </div>
      <div className="border-b-2 border-orange-700"></div>
    </nav>
  );
}

export default Nav;
