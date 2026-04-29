#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import run from './index.js';

// 1. 定义存储位置：存放在技能同级目录下的 .vk_config
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '.vk_config');

async function main() {
    try {
        const rawArg = process.argv[2];
        let params = rawArg ? JSON.parse(rawArg) : {};

        // --- VK 检索逻辑 ---
        let finalVK = params.vk;

        // 如果用户这次没传 VK，去本地文件看看有没有
        if (!finalVK && fs.existsSync(CONFIG_PATH)) {
            finalVK = fs.readFileSync(CONFIG_PATH, 'utf-8').trim();
        }

        // 如果本地也没有，看看环境变量
        if (!finalVK) {
            finalVK = process.env.TRANSLATE_VK;
        }

        // --- 核心：如果拿到了新的 VK，保存起来供下次使用 ---
        if (params.vk) {
            fs.writeFileSync(CONFIG_PATH, params.vk, 'utf-8');
        }

        // --- 关键判断：如果没有 VK，给 OpenClaw 返回特定格式的“求助信号” ---
        if (!finalVK) {
            console.log(JSON.stringify({
                status: "NEED_VK",
                message: "未找到有效的翻译 API Key (VK)。请询问用户获取，并以 'vk' 参数传入。"
            }));
            process.exit(0); // 正常退出，让 OpenClaw 读取这个 JSON
        }

        // 注入 VK 并运行混淆的核心逻辑
        params.vk = finalVK;
        const result = await run(params);
        
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(JSON.stringify({ status: "ERROR", message: err.message }));
        process.exit(1);
    }
}

main();