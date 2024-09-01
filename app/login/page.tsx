"use client";
import React, { useState } from "react";
import Image from "next/image";
import chattingImg from "./../assets/chit-chat.png";
import { useRouter } from "next/navigation";

import { loginUser, registerUser } from "@/api/users";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupMsg, setSignupMsg] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const res = await loginUser(username, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async () => {
    setSignupLoading(true);
    try {
      const res = await registerUser(username, password);
      if (res.success) {
        setSignupMsg(res.message);
      } else {
        setError(res.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleButtonClick = (action: "login" | "signup") => {
    setError("");
    setSignupMsg("");

    if (username.trim() === "") return setError("Please fill out your username.");
    else if (password.trim() === "") return setError("Please fill out your password.");

    if (action === "login") handleLogin();
    else handleSignup();
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left p-2">
          <div className="flex justify-center lg:justify-start">
            <Image
              className="max-w-sm rounded-lg"
              src={chattingImg}
              alt="icon"
              width={250}
              height={250}
            />
          </div>
          <h1 className="text-5xl font-bold pt-2">PeopleSync</h1>
          <p className="py-6">
            Connect with everyone who matters—friends, family, and colleagues. PeopleSync brings all your conversations together in one simple platform.
          </p>
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="username"
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="label">
                <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
              </label>
            </div>

            {error && (
              <div className="alert alert-warning">
                <span>{error}</span>
              </div>
            )}

            {signupMsg && (
              <div className="alert alert-success">
                <span>{signupMsg}</span>
              </div>
            )}

            <div className="form-control mt-6 flex flex-col gap-4 sm:flex-row sm:gap-4">
              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={() => handleButtonClick("login")}
              >
                {loginLoading ? <span className="loading loading-spinner"></span> : "Login"}
              </button>
              <button 
                type="button"
                className="btn btn-error flex-1"
                onClick={() => handleButtonClick("signup")}
              >
                {signupLoading ? <span className="loading loading-spinner"></span> : "Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
