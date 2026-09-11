"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getUserData } from "@/app/lib/session";
import { logout } from "@/app/(logged out)/login/actions";

export default function TopBar({ title = "Tratos" }: { title?: string }) {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserData().then((data) => {
      if (data) {
        setUserName(data.userName || "");
      }
    });
  }, []);

  return (
    <div className="w-full bg-white py-2 h-14 px-3 flex items-center shadow-sm z-10">
      <div className="flex w-full">
        <p id="title" className="font-medium text-black flex-1 flex items-center">
          {title}
        </p>
        <div className="flex gap-1 flex-1 justify-end items-center">
          <div ref={userMenuRef} className="relative">
            <div
              onClick={() => {
                setOpenUserMenu((prev) => !prev);
              }}
              className={`p-1 flex transition items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer hover:[&_svg]:stroke-black`}
            >
              <div className="rounded-full bg-gray-200 px-1 min-w-7.75 py-1.25 text-[#65686f] font-medium text-[14px] text-center">
                {userName ? userName.split(" ").map((n) => n[0]).join("") : "US"}
              </div>
            </div>
            {openUserMenu && (
              <div className="absolute right-0 top-11 z-120 min-w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-xl">
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <LogOut className="h-4 w-4" color="var(--gray-2)" />
                    <span>Cerrar sesión</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
