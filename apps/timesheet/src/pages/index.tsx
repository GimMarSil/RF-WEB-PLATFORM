import { Button, Layout } from '@RFWebApp/ui';

const sidebar = (
  <nav className="p-4 space-y-2">
    <a href="#" className="block">
      Inicio
    </a>
  </nav>
);

const header = <div className="font-semibold">Timesheet</div>;

export default function Home() {
  return (
    <Layout sidebar={sidebar} header={header}>
      <div className="space-y-2">
        <div>$app app</div>
        <Button>Example Button</Button>
      </div>
    </Layout>
  );
}
