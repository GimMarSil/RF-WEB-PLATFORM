import { Button, Layout } from '@RFWebApp/ui';

const sidebar = (
  <nav className="p-4 space-y-2">
    <a href="#" className="block">
      Inicio
    </a>
  </nav>
);

const header = <div className="font-semibold">Inventory</div>;

export default function Home() {
  return (
    <Layout sidebar={sidebar} header={header}>
      <div className="space-y-2">
        <div>Inventory app</div>
        <Button>Example Button</Button>
      </div>
    </Layout>
  );
}
