import { Cursor } from "../components/Cursor";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Cursor />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
