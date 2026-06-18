#!/bin/sh

VER=$(node -e 'console.log(require("./package.json").version)')
echo Building docs-app
echo VER:$VER

echo Clean dist
rm -rf dist

echo "生成 .source"
npx fumadocs-mdx

echo "构建中"
npm run build

echo "生成搜索索引"
node scripts/generate-search-index.mjs

echo "删除开发依赖"
cp package.json package.json.bak
node -e 'const j = require("./package.json");j["devDependencies"]={};fs.writeFileSync("package.json", JSON.stringify(j, null, 2));'

echo "压缩中"
zip -r dist.zip dist/public/ server.js package.json icon.svg

echo "还原中"
mv package.json.bak package.json

echo "打包完成：dist.zip"
echo OK
