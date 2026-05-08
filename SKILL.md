---
name: myxz-image-translator-skill
description: 妙言小智 (PicTech.cc) 专业级跨境电商图片翻译工具，支持批量图片翻译、缓存加速与多语言自动映射。
---

# 🌐 服务说明
本 Skill 由 pictech.cc 提供能力支持，后端由 stableai.com.cn 提供推理服务。

- API 服务：https://stableai.com.cn/myxz/skill/translate
- 技术支持：妙言小智
- 数据安全：图片仅用于实时翻译，不做持久化存储

---

# 🔐 API Key（VK）管理规则（非常重要）

本 Skill 依赖 VK 进行鉴权，但 **VK 不需要每次输入**，由系统自动管理。

## ✔ 获取方式
请前往 https://www.pictech.cc/newpictech/skills/openclaw-image-translation-skill 申请 VK 密钥

---

## ✔ 使用规则（Agent 必须遵守）

1. 系统会自动从 `config.vk` 读取 API Key
2. 用户只需在 Skill 设置中填写一次 VK
3. **禁止在 params 中要求用户每次输入 vk**
4. 若 config.vk 存在，必须优先使用

---

## ❌ 禁止行为
- ❌ 不得每次任务索要 VK
- ❌ 不得在 input 参数中要求 vk
- ❌ 不得提示用户重复输入 key

---

# ⚙️ Inputs 参数说明

## input（必填）
支持：
- 图片 URL
- 本地图片路径
- 文件夹路径（批量）

---

## saveDir（可选）
保存目录，不填则默认：./myxz-result/Translations


---

## sourceLanguage（可选）
默认：中文  
支持：
- 中文 / 繁体中文 / English / Japanese

---

## targetLanguage（可选）
默认：英文  
支持：
- 英文 / 日文 / 韩文 / 法文 / 德文 / 西班牙文 等19种语言

---

# 🧠 执行逻辑（必须遵守）

## 1️ VK 获取优先级

```text
config.vk  >  params.vk（仅兼容） > process.env
````

## 2️ 运行行为

* 自动识别输入资源
* 批量处理图片
* 使用缓存加速重复任务
* 自动归档输出

## 3️ 错误处理

如果 VK 缺失：

返回：

```json
{
  "success": false,
  "error": "请在插件设置中填写 API Key (VK)"
}
```

---

# 📦 输出格式规范

任务完成后必须返回结构化报告：

## 成功任务

* 素材名称
* 任务ID
* 预览图（resultUrl）
* 本地路径

---

## 示例结构

```json
{
  "任务状态": "翻译完成",
  "成功数量": 3,
  "失败数量": 0,
  "结果": [
    {
      "文件": "xxx.png",
      "任务ID": "xxxx",
      "预览": "https://...",
      "本地路径": "/xxx/xxx.png"
    }
  ]
}
```

---

# 🚀 Example Usage

## 单张图片

```json
{
  "input": "https://example.com/a.png",
  "sourceLanguage": "中文",
  "targetLanguage": "英文"
}
```

---

## 批量文件夹

```json
{
  "input": "D:/images",
  "sourceLanguage": "日文",
  "targetLanguage": "中文"
}
```

---

# 🔒 安全规范

* API Key 不得暴露在日志中
* 不得返回 VK 内容
* 所有请求必须使用 HTTPS
* 图片仅用于即时推理

---

# 🧩 Skill 运行入口

本 Skill 直接由：

```text
index.js (run function)
```
