import React, { Suspense } from "react";
import CustomerSignIn from "@/components/auth/CustomerSignIn";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading sign in portal...</div>}>
      <CustomerSignIn />
    </Suspense>
  );
}
