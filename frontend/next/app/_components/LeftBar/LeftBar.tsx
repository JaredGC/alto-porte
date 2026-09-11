"use client";

import Image from "next/image";
import React from "react";
import { Tooltip } from "@heroui/tooltip";
import {
  FileText,
} from "lucide-react";
import Link from "next/link";

type NavKey = "Tratos";

export default function Leftbar({
  active = "Tratos",
}: {
  active?: NavKey;
  redBadge?: number;
  blueBadge?: number;
}) {
  return (
    <aside className="h-auto min-h-screen w-14.5 flex flex-col items-center py-3" style={{
        background: "var(--bg-leftbar)",
      }}>
      <div className="text-white text-[44px] font-semibold leading-none select-none cursor-pointer">
        <Image src="/logo.png" alt="alto-porte-logo" height={22} width={32} className="ml-1"/>
      </div>

      <nav className="mt-5.75 flex flex-col items-center gap-3 w-full">
        <div className="relative w-full flex justify-center">
          <IconButton active={active === "Tratos"} label="Tratos" notys={19} urgent shouldRedirect>
            <FileText className="h-6.25 w-6.25 text-white" />
          </IconButton>
        </div>
      </nav>

      <div className="flex-1" />
    </aside>
  );
}

function IconButton({
  children,
  active,
  label,
  notys = 0,
  shouldRedirect = false,
  beta = false,
  urgent = false,
}: {
  children: React.ReactNode;
  active?: boolean;
  label: string;
  notys?: number;
  shouldRedirect?: boolean;
  beta?: boolean;
  urgent?: boolean;
}) {
  return (
    <Tooltip
      content={
        <div className="relative -ml-1">
          <div className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-(--black-1)" />
          <div className="px-2 py-2 bg-(--black-1) rounded-sm text-white flex items-center">
            <div className="text-xs font-normal">{label}</div>
            {notys > 0 && (
              <div className="text-xs font-normal p-1 ml-2 bg-[#616161] rounded-sm min-w-6.25 text-center">{notys}</div>
            )}
            {beta && (
              <div className="text-xs font-normal p-1 ml-2 bg-[#616161] rounded-sm min-w-6.25 text-center">BETA</div>
            )}
          </div>
        </div>
      }
      showArrow={true}
      placement="right"
    >
      <Link href={shouldRedirect ? `/${label.toLowerCase()}` : "#"} className="w-full">
        <div className="relative w-full flex justify-center">
          <button
            aria-label={label}
            className={[
              "h-11 w-11 cursor-pointer rounded-sm flex items-center justify-center",
              active ? "bg-[#232323]" : "bg-transparent",
              "transition-colors hover:bg-[#232323]",
            ].join(" ")}
          >
            {children}
          </button>
          {notys > 0 && (
            <span
              style={{ backgroundColor: urgent ? "#FF3B30" : "#2F80ED" }}
              className=" absolute right-0 -top-1.75 h-5 w-auto px-1.5 rounded-full text-white text-[10px] border-2 border-(--bg-leftbar) font-semibold flex items-end justify-center"
            >
              {notys > 99 ? "99+" : notys}
            </span>
          )}
        </div>
      </Link>
    </Tooltip>
  );
}
