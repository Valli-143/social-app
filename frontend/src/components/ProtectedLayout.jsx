import BottomNav from "./BottomNav";

export default function ProtectedLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
