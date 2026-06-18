import { Link } from 'waku';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <img src="/logo.svg" alt="JSOS" className="w-24 h-24 mb-6" />
      <h1 className="font-medium text-xl mb-4">JSOS 开发文档</h1>
      <p className="text-fd-muted-foreground mb-6 max-w-md">
        JSOS 是一个基于 WebContainer 的浏览器端桌面操作系统，支持多窗口应用管理、工作区和小组件。
      </p>
      <Link
        to="/docs"
        className="px-3 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm mx-auto"
      >
        浏览文档
      </Link>
    </div>
  );
}

export async function getConfig() {
  return {
    render: 'static',
  };
}
