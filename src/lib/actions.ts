"use server";

import { revalidatePath } from "next/cache";
import { supabaseService } from "./supabase";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/utils/server/verifySessionCookie";

export async function updateProfileName(formData: FormData) {
  const session = cookies().get("session");

  if (!session) throw new Error("Not authorized");

  const token = await verifySessionCookie(session.value);
  if (!token) throw new Error("Not authorized");

  const rawFormData = {
    name: formData.get("profileName"),
    authId: token.uid,
    lang: formData.get("lang"),
    formName: formData.get("formName"),
  };

  // Check if form data is valid
  if (
    typeof rawFormData.name !== "string" ||
    rawFormData.name.length > 24 ||
    typeof rawFormData.authId !== "string" ||
    !rawFormData.lang ||
    !rawFormData.formName
  ) {
    throw new Error("Invalid form data");
  }

  const res = await supabaseService
    .from("profiles")
    .update({ first_name: rawFormData.name })
    .eq("auth_id", rawFormData.authId);

  if (res.error) {
    throw new Error("Error updating profile name");
  }

  revalidatePath(`/[lang]/donors/profile`, "layout");
  revalidatePath(`/[lang]`);
  redirect(
    `/${rawFormData.lang}/donors/profile/general?success-form-name=${rawFormData.formName}`
  );
}
