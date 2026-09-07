"use server";

import * as Yup from "yup";
import { redirect } from "next/navigation";
import { createSession, deleteSession, UserData } from "../../lib/session";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const loginSchema = Yup.object().shape({
  email: Yup.string().required("El correo es obligatorio"),
  password: Yup.string().required("La contraseña es obligatoria"),
});

export async function login(_prevState: any, formData: FormData) {

  try {
    const result = await loginSchema.validate(Object.fromEntries(formData));
    const { email, password } = result;
  
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return {error: data.message || "Error en la autenticación"};
    }
  
    await createSession(data as UserData);
  
    redirect("/");
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    return {error: error.errors[0]};
  }

}

export async function logout() {
  await deleteSession();
  redirect("/login");
}