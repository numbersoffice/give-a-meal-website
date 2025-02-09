import { auth as authConfig } from "@/lib/firebase";
import { initAdminApp } from "@/lib/firebaseAdmin";
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
  let userCredential: UserCredential | undefined;

  // Get email query parameters
  const email = request.nextUrl.searchParams.get("email");
  const lang = request.nextUrl.searchParams.get("user-lang");

  const isValid = isSignInWithEmailLink(authConfig, request.url);

  if (email && isValid) {
    userCredential = await signInWithEmailLink(authConfig, email, request.url);
  } else {
    NextResponse.redirect(request.url + "/donors/login");
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

    console.log("Origin: ", request.nextUrl.origin);
    console.log("Host Header: ", request.headers.get("host"));

    return NextResponse.redirect(
      `${request.nextUrl.origin}/${lang}/donors/profile`
    );
  } else {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/${lang}/donors/login`
    );
  }
}
