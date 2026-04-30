/** 
 * MyXZ Image Translation Skill 
 * Official Website: https://www.pictech.cc
 * Service Provider: https://stableai.com.cn (妙言小智技术服务支持)
 */
import os from 'node:os';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import FormData from 'form-data';
import axios from 'axios';
import { initDB, dbOps } from './database.js';
import { utils } from './utils.js';

// 妙言小智的skill地址
const API_BASE = "https://stableai.com.cn/myxz/skill/translate";
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

const ALLOWED_SOURCE_API_CODES = ["Chinese", "ChineseTraditional", "English", "Japanese"];


// 语言映射表（用于规范化缓存键）
const USER_TO_API_LANG = {
    "中文": "Chinese", "汉语": "Chinese", "繁体中文": "ChineseTraditional",
    "中文繁体": "ChineseTraditional",
    "英文": "English", "英语": "English",
    "日文": "Japanese", "日语": "Japanese",
    "韩文": "Korean", "韩语": "Korean",
    "泰文": "Thai", "泰语": "Thai",
    "俄文": "Russian", "俄语": "Russian",
    "葡萄牙文": "Portuguese", "葡萄牙语": "Portuguese",
    "西班牙文": "Spanish", "西班牙语": "Spanish",
    "法文": "French", "法语": "French",
    "意文": "Italian", "意大利语": "Italian",
    "德文": "German", "德语": "German",
    "波兰文": "Polish", "波兰语": "Polish",
    "荷兰文": "Dutch", "荷兰语": "Dutch",
    "土耳其文": "Turkish", "土耳其语": "Turkish",
    "越南文": "Vietnamese", "越南语": "Vietnamese",
    "印尼文": "Indonesian", "印尼语": "Indonesian",
    "马来文": "Malay", "马来语": "Malay",
    "菲律宾文": "Filipino", "菲律宾语": "Filipino"
};

/**
 * 转换并校验语言
 * @returns {string|null} 成功返回英文标识，失败返回 null
 */
const toApiLang = (userLang) => {
    if (!userLang) return null;
    const trimmed = userLang.trim();
    return USER_TO_API_LANG[trimmed] || null; // 找不到不再返回原词，而是返回 null
};
/**
 * 规范化语言名称/代码
 */
const normalizeLang = (lang) => LANG_MAP[lang] || lang.toLowerCase();

/**
 * 核心执行器
 */
export default async function run(params) {
    let {
        input,
        saveDir,
        sourceLanguage = '中文',
        targetLanguage = '英文'
    } = params;

     // 如果用户没填，默认保存到：用户文件夹/OpenClaw_Outputs/Translations
    if (!saveDir || saveDir.trim() === '') {
        saveDir = path.join(process.cwd(), 'myxz-result', 'Translations');
    }

    const apiSourceLang = toApiLang(sourceLanguage);
    if (!apiSourceLang || !ALLOWED_SOURCE_API_CODES.includes(apiSourceLang)) {
        return { 
            success: false, 
            error: `源语言只支持：中文、繁体中文、英文、日文。您输入的是: "${sourceLanguage}"` 
        };
    }

    const apiTargetLang = toApiLang(targetLanguage);

    if (!apiTargetLang) {
        return {
            success: false,
            error: `不支持的目标语言: "${targetLanguage}"。`
        };
    }
    const vk = params.config?.vk || params.vk;
    // 1. VK 校验
    const activeVK = vk;
    if (!activeVK) {
        return { success: false, error: "缺少 API Key (VK)，请在插件配置中输入。" };
    }

    // 2. 环境初始化
    const absoluteSaveDir = path.resolve(saveDir);
    await fsPromises.mkdir(absoluteSaveDir, { recursive: true });

    const dateStr = new Date().toISOString().split('T')[0];
    const batchId = crypto.randomBytes(3).toString('hex');
    const batchDir = path.join(absoluteSaveDir, dateStr, batchId);
    await fsPromises.mkdir(batchDir, { recursive: true });

    const db = initDB(absoluteSaveDir);
    await dbOps.cleanup(db);

    // 3. 解析输入源
    let sources = Array.isArray(input) ? input : (input.includes(',') ? input.split(',') : [input]);
    let tasks = [];
    for (let s of sources) {
        s = s.trim();
        if (!s) continue;
        if (s.startsWith('http')) {
            tasks.push({ type: 'url', path: s });
        } else if (fs.existsSync(s)) {
            const stats = await fsPromises.lstat(s);
            if (stats.isDirectory()) {
                const files = await fsPromises.readdir(s);
                for (const f of files) {
                    if (utils.isValidFormat(path.extname(f))) {
                        tasks.push({ type: 'file', path: path.join(s, f) });
                    }
                }
            } else if (utils.isValidFormat(path.extname(s))) {
                tasks.push({ type: 'file', path: s });
            }
        }
    }

    const summary = { total: tasks.length, details: [] };

    // 4. 任务处理循环
    for (const task of tasks) {
        let buffer, fileName, tempPath = null;
        try {
            // A. 加载图片
            if (task.type === 'url') {
                const dl = await utils.downloadUrl(task.path);
                buffer = dl.buffer;
                fileName = dl.name;
                tempPath = dl.tempPath;
            } else {
                const stats = await fsPromises.stat(task.path);
                if (stats.size > MAX_SIZE) throw new Error("文件超过15MB限制");
                buffer = await fsPromises.readFile(task.path);
                fileName = path.basename(task.path);
            }

            // B. 计算 Hash 与 缓存键
            const hash = utils.getHash(buffer);
            // 规范化语言代码，确保缓存键唯一

            const cacheKey = `${hash}_${apiSourceLang}_${apiTargetLang}`;

            // 为了防止同名文件冲突，文件名加入 hash 前 4 位
            const targetName = `trans_${hash.slice(0, 4)}_${path.basename(fileName, path.extname(fileName))}.png`;
            const localSavePath = path.join(batchDir, targetName);

            // C. 检查缓存
            const record = await dbOps.find(db, { cacheKey });
            if (record && record.status === 'success' && fs.existsSync(record.localPath)) {
                await fsPromises.copyFile(record.localPath, localSavePath);
                summary.details.push({
                    taskId: record.taskId,
                    input: task.path,
                    status: "成功(缓存)",
                    resultUrl: record.resultUrl,
                    localPath: localSavePath
                });
                continue;
            }

            // D. 提交任务
            const form = new FormData();
            form.append('file', buffer, { filename: fileName });
            form.append('sourceLanguage', apiSourceLang);
            form.append('targetLanguage', apiTargetLang);

            const sRes = await axios.post(`${API_BASE}/submittask`, form, {
                headers: { 'X-Skill-VK': activeVK, ...form.getHeaders() }
            });

            if (sRes.data.code !== 200) throw new Error(sRes.data.message || "提交失败");
            const taskId = sRes.data.data.taskId;

            // E. 轮询结果
            let resultUrl = null;
            for (let i = 0; i < 40; i++) {
                await utils.sleep(2500);
                const qRes = await axios.post(`${API_BASE}/querytask`, { taskId }, {
                    headers: { 'X-Skill-VK': activeVK }
                });

                const resData = qRes.data;
                if (resData.code !== 200) throw new Error(`查询失败: ${resData.message}`);

                const status = resData.data.status;
                if (status === 200) {
                    resultUrl = resData.data.resultUrl;
                    break;
                } else if (status === 202) {
                    continue;
                } else {
                    throw new Error(`处理失败: 状态码 ${status}`);
                }
            }

            if (!resultUrl) throw new Error("处理超时");

            // F. 下载并保存
            const imgRes = await axios.get(resultUrl, { responseType: 'arraybuffer' });
            await fsPromises.writeFile(localSavePath, Buffer.from(imgRes.data));

            // G. 存入数据库
            const dataDoc = {
                cacheKey,
                taskId,
                hash,
                sourceLanguage: apiSourceLang,
                targetLanguage: apiTargetLang,
                resultUrl,
                localPath: localSavePath,
                createdAt: Date.now(),
                status: 'success'
            };
            await dbOps.insert(db, dataDoc);

            summary.details.push({
                taskId: taskId,
                input: task.path,
                status: "成功",
                resultUrl: resultUrl,
                localPath: localSavePath
            });

        } catch (err) {
            summary.details.push({
                input: task.path,
                status: "失败",
                error: err.message
            });
        } finally {
            if (tempPath && fs.existsSync(tempPath)) {
                await fsPromises.rm(tempPath).catch(() => { });
            }
        }
    }

    // 5. 生成报告
    const successList = summary.details.filter(d => d.status.includes("成功"));
    const failList = summary.details.filter(d => d.status === "失败");

    const report = {
        "任务状态": `✨ 翻译任务完成！(成功: ${successList.length} / 总计: ${summary.total})`,
        "语言方向": `${sourceLanguage} ➔ ${targetLanguage}`,
        "本地保存目录": batchDir,
        "成功详情": successList.map(d => ({
            "素材名": path.basename(d.input),
            "任务ID": d.taskId,
            "原始来源": d.input,
            "预览": d.resultUrl,
            "本地路径": d.localPath
        }))
    };

    if (failList.length > 0) {
        report["失败详情"] = failList.map(d => ({
            "素材名": path.basename(d.input),
            "原始来源": d.input,
            "失败原因": d.error
        }));
    }

    return report;
}