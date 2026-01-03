const fs = require('fs');
const path = require('path');

// 尝试加载 terser，如果不存在则使用简单的压缩方法
let terser;
try {
  terser = require('terser');
} catch (e) {
  console.warn('警告: terser 未安装，将使用简单压缩方法');
  console.warn('建议运行: npm install terser --save-dev\n');
}

const sourceFile = path.join(__dirname, 'monitoring.js');
const devOutputDir = path.join(__dirname, 'dist');
const devOutputFile = path.join(devOutputDir, 'monitoring.dev.js');
const prodOutputFile = path.join(devOutputDir, 'monitoring.min.js');

// 确保 dist 目录存在
if (!fs.existsSync(devOutputDir)) {
  fs.mkdirSync(devOutputDir, { recursive: true });
}

// 读取源文件
const sourceCode = fs.readFileSync(sourceFile, 'utf8');

// 构建开发版本（添加版本信息和注释）
function buildDev() {
  const devCode = `/**
 * 前端页面监控插件 - 开发版本
 * 版本: ${new Date().toISOString().split('T')[0]}
 * 可以嵌入到任何前端项目中，自动收集访问数据并发送到监控服务器
 */
${sourceCode}`;

  fs.writeFileSync(devOutputFile, devCode, 'utf8');
  console.log('✓ 开发版本已生成: dist/monitoring.dev.js');
}

// 简单的代码压缩（移除注释和多余空白）
function simpleMinify(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
    .replace(/\/\/.*$/gm, '') // 移除行注释
    .replace(/\s+/g, ' ') // 合并多个空白
    .replace(/;\s*}/g, '}') // 移除分号后的空白
    .replace(/{\s+/g, '{') // 移除 { 后的空白
    .replace(/\s+}/g, '}') // 移除 } 前的空白
    .replace(/,\s+/g, ',') // 移除逗号后的空白
    .replace(/;\s+/g, ';') // 移除分号后的空白
    .trim();
}

// 构建生产版本（压缩）
async function buildProd() {
  try {
    let result;
    
    if (terser) {
      // 使用 terser 进行专业压缩
      const minifyResult = await terser.minify(sourceCode, {
        compress: {
          drop_console: false, // 保留 console，方便调试
          drop_debugger: true,
          pure_funcs: ['console.debug'], // 移除 console.debug
          passes: 2, // 多次压缩以获得更好的效果
        },
        mangle: {
          reserved: ['WebPageMonitoring', 'init', 'track', 'trackPageView', 'config'], // 保留这些名称
        },
        format: {
          comments: false, // 移除注释
          preamble: '/* 前端页面监控插件 - 压缩版本 */', // 添加简短注释
        },
      });

      if (minifyResult.error) {
        throw minifyResult.error;
      }
      
      result = {
        code: minifyResult.code
      };
    } else {
      // 使用简单压缩方法
      const minifiedCode = simpleMinify(sourceCode);
      result = {
        code: '/* 前端页面监控插件 - 压缩版本 */\n' + minifiedCode
      };
    }

    fs.writeFileSync(prodOutputFile, result.code, 'utf8');
    
    const originalSize = Buffer.byteLength(sourceCode, 'utf8');
    const minifiedSize = Buffer.byteLength(result.code, 'utf8');
    const compressionRatio = ((1 - minifiedSize / originalSize) * 100).toFixed(2);
    
    console.log('✓ 生产版本已生成: dist/monitoring.min.js');
    console.log(`  原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`  压缩后: ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`  压缩率: ${compressionRatio}%`);
  } catch (error) {
    console.error('压缩失败:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const mode = process.argv[2] || 'all';

  console.log('开始构建监控插件...\n');

  if (mode === 'dev' || mode === 'all') {
    buildDev();
  }

  if (mode === 'prod' || mode === 'all') {
    await buildProd();
  }

  console.log('\n构建完成！');
}

main().catch(console.error);
