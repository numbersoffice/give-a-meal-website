import { auth as authConfig } from "@/lib/firebase";
import { initAdminApp } from "@/lib/firebaseAdmin";
import getProxyOrigin from "@/utils/getProxyOrigin";
import { auth } from "firebase-admin";
import {
  UserCredential,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Init the Firebase SDK every time the server is called
initAdminApp();

export async function GET(request: NextRequest) {
  const origin = getProxyOrigin(request);
  let userCredential: UserCredential | undefined;

  // Get email query parameters
  const email = request.nextUrl.searchParams.get("email");
  const lang = request.nextUrl.searchParams.get("user-lang");

  const isValid = isSignInWithEmailLink(authConfig, request.url);

  console.log("Email auth request: ", email);
  console.log(request.url);

  if (email && isValid) {
    userCredential = await signInWithEmailLink(authConfig, email, request.url);
  } else {
    NextResponse.redirect(origin + "/donors/login");
  }

  if (userCredential) {
    const idToken = await userCredential.user.getIdToken();
    // 2 weeks in milliseconds
    const expiresIn = 14 * 24 * 60 * 60 * 1000;
    const sessionCookie = await auth().createSessionCookie(idToken, {
      expiresIn,
    });

    const isDev = process.env.NODE_ENV === "development";
    const options = {
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: isDev ? false : true,
    };

    cookies().set(options);

    return NextResponse.redirect(`${origin}/${lang}/donors/profile`);
  } else {
    return NextResponse.redirect(`${origin}/${lang}/donors/login`);
  }
}
