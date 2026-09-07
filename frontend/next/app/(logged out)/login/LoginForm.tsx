"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "./actions";

export function LoginForm() {
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <form
        action={loginAction}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg flex flex-col gap-5"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-semibold text-slate-800">
            Bienvenido
          </h1>
          <p className="text-sm text-slate-500">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <input
            id="email"
            name="email"
            placeholder="Correo electrónico"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1">
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {state?.error && (
            <p className="text-xs text-red-500">{state.error}</p>
        )}
        <div className="flex flex-col gap-2 mt-4">
          <SubmitButton />
          <RegisterButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="mt-0 rounded-xl bg-slate-800 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Ingresando..." : "Iniciar sesión"}
    </button>
  );
}

function RegisterButton() {
  return (
    <button
      type="submit"
      onClick={() => {
        window.location.href = "/register";
      }}
      className="mt-0 rounded-xl bg-white py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800"
    >
      Registrarse
    </button>
  );
}