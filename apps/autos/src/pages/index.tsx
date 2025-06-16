import { Button, Layout } from '@RFWebApp/ui';

export default function Home() {
  return (
    <Layout navItems={[{ href: '/', label: 'Home' }]}>
      <div className="space-y-2">
        <div>Autos app</div>
        <Button>Example Button</Button>
      </div>
    </Layout>
  );
}
