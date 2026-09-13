import Leftbar from "../_components/LeftBar/LeftBar";
import TopBar from "../_components/TopBar/TopBar";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <Leftbar active="Leads" />
      <div className="flex flex-col w-full bg-(--gray-1)">
        <TopBar title="Tratos" />
        {children}
      </div>
    </div>
  );
}