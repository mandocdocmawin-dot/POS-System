import {z} from 'zod';
import {authService} from '../../services/authService';
import {DemoAccountsCard} from '../../components/auth/DemoAccountsCard';
import { AccountFlow } from "./AccountFlow";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { AuthField } from "./AuthField";
export function Component() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const signUp = pathname.endsWith("/sign-up");
  const forgot = pathname.endsWith("/forgot-password");
  const signIn = pathname.endsWith("/sign-in");
  if (!signUp && !forgot && !signIn) return <AccountFlow />;
  return (
    <>
      <div className="mb-7">
        <span className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-500 dark:bg-indigo-500/15">
          <LockKeyhole size={23} />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {signUp
            ? "Create your account"
            : forgot
              ? "Forgot your password?"
              : "Welcome back"}
        </h1>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {signUp
            ? "Start your next chapter with TindaPOS."
            : forgot
              ? "Enter your email to preview the password reset flow."
              : "Sign in to see how your business is doing."}
        </p>
      </div>
      <form
        noValidate className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          const data=new FormData(e.currentTarget);
          try {
            if(forgot) navigate('/auth/two-step-verification');
            else {if(signUp){const fields=z.object({name:z.string().trim().min(1,'Name is required.'),email:z.email()}).parse({name:String(data.get('name')??''),email:String(data.get('email')??'')});authService.signUp(fields.name,fields.email);}else authService.login(String(data.get('email')??''));navigate(authService.firstPath());}
          } catch(error){setNotice(error instanceof Error?error.message:'Unable to save session.');}
        }}
      >
        {signUp && (
          <AuthField label="Full name" name="name" autoComplete="name" />
        )}
        <AuthField
          label="Email address"
          name="email"
          defaultValue={signIn?"admin@tindapos.demo":undefined}
          type="email"
          autoComplete="email"
        />
        {!forgot && (
          <AuthField
            label="Password"
            name="password"
            type="password"
            
            autoComplete={signUp ? "new-password" : "current-password"}
          />
        )}
        <div className="flex items-center justify-between gap-2 text-xs">
          {signUp ? (
            <label className="flex items-center gap-2">
              <input type="checkbox" />I agree to the{" "}
              <Link className="text-indigo-500" to="/privacy-policy">
                Privacy Policy
              </Link>
            </label>
          ) : (
            !forgot && (
              <>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Remember me
                </label>
                <Link className="text-indigo-500" to="/auth/forgot-password">
                  Forgot password?
                </Link>
              </>
            )
          )}
        </div>
        <button className="btn-primary w-full py-2.5" type="submit">
          {signUp
            ? "Create Account"
            : forgot
              ? "Send Reset Instructions"
              : "Sign In"}
          <ArrowRight size={15} />
        </button>
        {notice&&<p role="alert" className="text-xs text-red-500">{notice}</p>}
      </form>
      {signIn&&<><p className="mt-4 text-xs text-slate-500">Demo mode: no real authentication. Any credentials work.</p><DemoAccountsCard/></>}
      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400 dark:border-slate-800">
        {signIn ? (
          <>
            New to TindaPOS?{" "}
            <Link to="/auth/sign-up" className="font-medium text-indigo-500">
              Create an account
            </Link>
          </>
        ) : (
          <Link to="/auth/sign-in" className="font-medium text-indigo-500">
            Back to Sign In
          </Link>
        )}
      </div>
      <p className="mt-5 text-center text-xs text-slate-400">
        UI preview only. No real authentication.
      </p>
    </>
  );
}
