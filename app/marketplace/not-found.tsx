import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NotFoundState } from "@/components/marketplace/not-found-state";

export default function MarketplaceNotFound() {
  return (
    <>
      <Navbar />
      <main className="pt-32">
        <NotFoundState />
      </main>
      <Footer />
    </>
  );
}
