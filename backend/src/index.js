const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const { initDatabase } = require('./database/init');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const eventRoutes = require('./routes/events');
const statsRoutes = require('./routes/stats');

const app = express();

// 中间件
app.use(cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: config.cors.credentials,
}));

app.options('*', cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 初始化数据库
initDatabase();

// 路由
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/projects', statsRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(config.port, () => {
    console.log(`监控服务后端运行在 http://localhost:${config.port}`);
});
