import HebrewStatsNavbar from "./components/HebrewStatsNavbar";

export default function HebrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HebrewStatsNavbar />
      {children}
    </>
  );
}
