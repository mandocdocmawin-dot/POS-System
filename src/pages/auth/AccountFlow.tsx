import {staffService} from '../../services/staffService';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCheck, ShieldCheck, KeyRound, UserRoundX } from "lucide-react";
import { useState } from "react";
import { AuthField } from "./AuthField";
import { VerificationCode } from "./VerificationCode";
export function AccountFlow() {
  const { pathname, state } = useLocation();
  const deactivated=!!(state as {deactivated?:boolean}|null)?.deactivated;
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const verify = pathname.endsWith("/two-step-verification");
  const reset = pathname.endsWith("/reset-password");
  const success = pathname.endsWith("/successful-password");
  const title = verify
    ? "Two step verification"
    : reset
      ? "Set a new password"
      : success
        ? "Password updated!"
        : deactivated?"Account deactivated":"Deactivate your account";
  const Icon = verify
    ? ShieldCheck
    : reset
      ? KeyRound
      : success
        ? CheckCheck
        : UserRoundX;
  return (
    <>
      <span
        className={`mb-5 inline-flex rounded-xl p-3 ${success ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10" : "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"}`}
      >
        <Icon size={26} />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mb-7 mt-2 text-xs leading-5 text-slate-400">
        {verify
          ? "Enter any six digits to preview verification. No message was sent."
          : reset
            ? "Enter any password to continue the demo reset flow."
            : success
              ? "Your password reset preview is complete. You can return to sign in."
              : deactivated?"Your staff account is inactive and you have been signed out. You can still use demo login.":"Deactivation marks your staff record inactive and signs you out."}
      </p>
      {success||deactivated ? (
        <Link className="btn-primary w-full" to="/auth/sign-in">
          Back to Sign In
        </Link>
      ) : (
        <form
          noValidate className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if(!verify&&!reset){try{staffService.deactivateSelf();navigate('/auth/account-deactivation',{replace:true,state:{deactivated:true}});}catch(error){setNotice(error instanceof Error?error.message:'Unable to deactivate.');}return;}
            navigate(
              verify
                ? "/auth/reset-password"
                : reset
                  ? "/auth/successful-password"
                  : "/auth/sign-in",
            );
          }}
        >
          {verify ? (
            <VerificationCode />
          ) : reset ? (
            <>
              <AuthField
                label="New password"
                name="password"
                type="password"
                
                autoComplete="new-password"
              />
              <AuthField
                label="Confirm password"
                name="confirm"
                type="password"
                
                autoComplete="new-password"
              />
            </>
          ) : (
            <>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
                Your staff history is retained. The last active Admin cannot be deactivated.
              </div>
              <AuthField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
              <label className="flex items-start gap-2 text-xs">
                <input type="checkbox" required className="mt-0.5" />I
                understand and want to deactivate my account.
              </label>
            </>
          )}
          {notice && (
            <p role="alert" className="text-xs text-red-500">
              {notice}
            </p>
          )}
          <button
            type="submit"
            className={`btn-primary w-full ${!verify && !reset ? "border-red-500 bg-red-500 hover:bg-red-600 dark:border-red-500 dark:bg-red-500" : ""}`}
          >
            {verify
              ? "Verify Code"
              : reset
                ? "Reset Password"
                : "Deactivate Account"}
          </button>
          {verify && (
            <button
              type="button"
              className="w-full text-xs text-indigo-500"
              onClick={() =>
                setNotice("Demo only: no verification code has been sent.")
              }
            >
              Resend code
            </button>
          )}
        </form>
      )}
      <div className="mt-6 text-center">
        <Link to="/auth/sign-in" className="text-xs text-indigo-500">
          Back to Sign In
        </Link>
      </div>
      <p className="mt-5 text-center text-xs text-slate-400">
        Demo password flow. No credentials are checked or stored.
      </p>
    </>
  );
}
