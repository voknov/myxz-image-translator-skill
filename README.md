
# 🎨 妙言小智 (PicTech.cc) 专业级图片翻译 Skill

**—— OpenClaw / WorkBuddy / accio work / codex 生态中为跨境电商而生的生产级 AI [图像翻译](https://www.pictech.cc)解决方案**

<img width="1500" height="750" alt="spliced-hd-1778153629206" src="https://github.com/user-attachments/assets/f6e5c8c5-aaa2-4b9a-972b-5693b2dd8b09" />


## 🌟 核心价值

在亚马逊、Shopify、TikTok Shop 等跨境电商业务中，[图片素材的本地化](https://www.pictech.cc)质量直接决定了点击率与转化率。本 [图片翻译Skill](https://www.pictech.cc) 由 **[妙言小智 (PicTech.cc)](https://www.pictech.cc)** 官方出品，专为 AI Agent 设计，提供高度自动化、视觉无损的图片翻译能力。

### 为什么选择妙言小智？
*   **完美还原排版**：采用前沿的 OCR 识别与图像后期修补技术，翻译后文字完美嵌入原图位置，保持原有的字体风格、颜色与排版美感。
*   **极致 VK 管理体验**：遵循“一次输入，永久有效”原则。VK 密钥由系统配置统一管理，Agent 会自动读取，无需用户在每次对话中重复输入。
*   **强大的批量处理**：支持单个 URL、本地单张图片，甚至整个产品素材文件夹的递归处理，极速完成整店素材本地化。
*   **预览与反馈直观**：任务完成后提供结构化报告，支持直接在对话框渲染翻译后的预览图（resultUrl），并同步保存至本地。
*   **缓存加速机制**：内置智能缓存，相同素材重复翻译不消耗 API 额度，大幅提升响应速度。

---

## 🛠️ 安装与配置

本 Skill 适用于 **OpenClaw**、**WorkBuddy**、**Codex** 等支持标准 Agent Skills 的环境。

### 1. 环境依赖
确保你的系统中已安装 **Node.js v20+**。
```bash
git clone https://github.com/your-username/myxz-image-translator-skill.git
cd myxz-image-translator-skill
npm install
```
### 2. Agent安装
```bash
帮我安装妙言小智的图片翻译skill https://github.com/your-username/myxz-image-translator-skill.git
```

### 2. 获取并配置 VK (API Key)
本 Skill 必须使用 VK 密钥进行鉴权。
1.  **获取密钥**：前往 [妙言小智官网申请 VK 密钥](https://www.pictech.cc/newpictech/skills/openclaw-image-translation-skill)。
2.  **配置密钥**：在 Skill 的设置项（或 `config.vk`）中填写一次即可。
    *   *注：Agent 严禁在每次任务中索要 VK，系统会自动按 `config.vk > params.vk > process.env` 的优先级读取。*

---

## 🚀 快速上手 (Prompt 示例)

### 场景 A：翻译单张本地图片
> "请帮我用妙言小智翻译桌面上的 `product_info.jpg`，中文翻译成英文。"

### 场景 B：批量处理整个文件夹
> "使用妙言小智图片翻译 Skill，把 `D:/Shopify/Listing_01` 文件夹里的所有产品图翻译成日文，源语言是中文。"

### 场景 C：翻译网络图片 URL
> "翻译这张亚马逊主图：https://example.com/item.jpg，中文转德文。"

---

## 📋 输入参数说明 (Inputs)

| 参数 | 必填 | 类型 | 说明 |
| :--- | :--- | :--- | :--- |
| `input` | **是** | String | 支持：本地文件路径、图片 URL、或文件夹路径（批量处理） |
| `sourceLanguage` | 否 | String | 默认：`中文`。支持：`中文`、`繁体中文`、`English`、`Japanese` |
| `targetLanguage` | 否 | String | 默认：`英文`。支持：英、日、韩、法、德、西、泰、俄等 19 种主流语种 |
| `saveDir` | 否 | String | 默认路径：`./myxz-result/Translations` |

---

## 📦 输出规范

任务执行后，Skill 将返回标准的结构化 JSON 报告，方便 AI Agent 解析并展示给用户：

```json
{
  "任务状态": "翻译完成",
  "成功数量": 1,
  "失败数量": 0,
  "结果": [
    {
      "文件": "listing_main.jpg",
      "任务ID": "TR_88291024",
      "预览": "https://skill.pictech.top/preview/xxx.jpg",
      "本地路径": "C:/Users/Admin/myxz-result/Translations/listing_main_EN.jpg"
    }
  ]
}
```

---

## 🔐 安全与隐私

*   **API 加密**：后端服务由 `https://skill.pictech.top` 提供，所有传输均通过 HTTPS 加密。
*   **数据脱敏**：API Key (VK) 严禁出现在任何日志或返回体中。
*   **隐私保护**：图片仅用于实时 AI 推理服务，不做持久化存储。
*   **本地安全**：VK 密钥及翻译记录保存在用户本地磁盘，安全性由本地环境保障。

---

## 📬 关于妙言小智 (PicTech)

妙言小智致力于通过 AI 技术赋能跨境电商，提供高质量的图片与文案本地化方案。

*   **官方网站**: [妙言小智](https://pictech.cc)
*   **技术支持**: 若遇到 Skill 调用问题，请通过官网联系客服或在仓库提交 Issue。

---

**立即开始，让 AI 助您的产品素材跨越语言鸿沟！** 🌍
